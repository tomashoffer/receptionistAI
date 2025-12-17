import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppointmentEntity } from './appointment.entity';
import { CreateAppointmentDto, UpdateAppointmentDto, CreateAppointmentWithContactDto } from './dto';
import { GoogleService } from '../google/google.service';
import { GoogleCalendarService } from '../google-calendar/google-calendar.service';
import { ContactService } from '../contact/contact.service';
import { CreateContactDto } from '../contact/dto/create-contact.dto';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    @InjectRepository(AppointmentEntity)
    private appointmentRepository: Repository<AppointmentEntity>,
    private googleService: GoogleService,
    private googleCalendarService: GoogleCalendarService,
    private contactService: ContactService,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto): Promise<AppointmentEntity> {
    try {
      // Verificar disponibilidad antes de crear la cita
      const isAvailable = await this.googleService.checkAvailability(
        createAppointmentDto.appointmentDate,
        createAppointmentDto.appointmentTime
      );

      if (!isAvailable) {
        throw new Error('El horario seleccionado no está disponible');
      }

      const appointment = this.appointmentRepository.create(createAppointmentDto);
      const savedAppointment = await this.appointmentRepository.save(appointment);

      // Integrar con Google Calendar
      try {
        const calendarEvent = await this.googleService.createCalendarEvent(savedAppointment);
        savedAppointment.googleCalendarEventId = calendarEvent.id;
      } catch (error) {
        this.logger.error('Error creando evento en Google Calendar:', error);
      }

      // Integrar con Google Sheets
      try {
        const sheetRowId = await this.googleService.addToGoogleSheets(savedAppointment);
        savedAppointment.googleSheetsRowId = sheetRowId;
      } catch (error) {
        this.logger.error('Error agregando a Google Sheets:', error);
      }

      return this.appointmentRepository.save(savedAppointment);
    } catch (error) {
      this.logger.error('Error creando cita:', error);
      throw error;
    }
  }

  async findAll(): Promise<AppointmentEntity[]> {
    return this.appointmentRepository.find({
      order: { appointmentDate: 'ASC' },
    });
  }

  async findOne(id: string): Promise<AppointmentEntity> {
    const appointment = await this.appointmentRepository.findOne({ where: { id } });
    if (!appointment) {
      throw new NotFoundException(`Cita con ID ${id} no encontrada`);
    }
    return appointment;
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<AppointmentEntity> {
    const appointment = await this.findOne(id);
    Object.assign(appointment, updateAppointmentDto);
    
    // Actualizar en Google Calendar si existe
    if (appointment.googleCalendarEventId) {
      try {
        await this.googleService.updateCalendarEvent(appointment);
      } catch (error) {
        this.logger.error('Error actualizando evento en Google Calendar:', error);
      }
    }

    // Actualizar en Google Sheets si existe
    if (appointment.googleSheetsRowId) {
      try {
        await this.googleService.updateGoogleSheetsRow(appointment);
      } catch (error) {
        this.logger.error('Error actualizando fila en Google Sheets:', error);
      }
    }

    return this.appointmentRepository.save(appointment);
  }

  async remove(id: string): Promise<void> {
    const appointment = await this.findOne(id);
    
    // Eliminar de Google Calendar si existe
    if (appointment.googleCalendarEventId) {
      try {
        await this.googleService.deleteCalendarEvent(appointment.googleCalendarEventId);
      } catch (error) {
        this.logger.error('Error eliminando evento de Google Calendar:', error);
      }
    }

    await this.appointmentRepository.remove(appointment);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<AppointmentEntity[]> {
    return this.appointmentRepository
      .createQueryBuilder('appointment')
      .where('appointment.appointmentDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('appointment.appointmentDate', 'ASC')
      .addOrderBy('appointment.appointmentTime', 'ASC')
      .getMany();
  }

  async findByStatus(status: string): Promise<AppointmentEntity[]> {
    return this.appointmentRepository.find({
      where: { status: status as any },
      order: { appointmentDate: 'ASC' },
    });
  }

  async findByUserId(userId: string): Promise<AppointmentEntity[]> {
    return this.appointmentRepository.find({
      where: { userId },
      order: { appointmentDate: 'ASC' },
    });
  }

  async getAvailableSlots(date: string, durationMinutes?: number): Promise<string[]> {
    return this.googleService.getAvailableSlots(date, durationMinutes);
  }

  async findByPhoneAndDate(phone: string, date: string): Promise<AppointmentEntity[]> {
    return this.appointmentRepository
      .createQueryBuilder('appointment')
      .where('appointment.clientPhone = :phone', { phone })
      .andWhere('appointment.appointmentDate = :date', { date })
      .orderBy('appointment.appointmentTime', 'ASC')
      .getMany();
  }

  async findByDetails(options: {
    clientPhone: string;
    appointmentDate: string;
    appointmentTime?: string;
    serviceType?: string;
  }): Promise<AppointmentEntity | null> {
    const query = this.appointmentRepository
      .createQueryBuilder('appointment')
      .where('appointment.clientPhone = :clientPhone', {
        clientPhone: options.clientPhone,
      })
      .andWhere('appointment.appointmentDate = :appointmentDate', {
        appointmentDate: options.appointmentDate,
      });

    if (options.appointmentTime) {
      query.andWhere('appointment.appointmentTime = :appointmentTime', {
        appointmentTime: options.appointmentTime,
      });
    }

    if (options.serviceType) {
      query.andWhere('appointment.serviceType = :serviceType', {
        serviceType: options.serviceType,
      });
    }

    return query.getOne();
  }

  async findByCalendarId(googleCalendarEventId: string): Promise<AppointmentEntity> {
    const appointment = await this.appointmentRepository.findOne({
      where: { googleCalendarEventId },
    });

    if (!appointment) {
      throw new NotFoundException(
        `Cita con Google Calendar Event ID ${googleCalendarEventId} no encontrada`,
      );
    }

    return appointment;
  }

  async createWithContact(dto: CreateAppointmentWithContactDto): Promise<AppointmentEntity> {
    // Buscar contacto existente por email o teléfono
    let contact = await this.contactService.findByEmailOrPhone(
      dto.business_id,
      dto.clientEmail,
      dto.clientPhone,
    );

    // Si no existe, crear el contacto
    if (!contact) {
      const createContactDto: CreateContactDto = {
        business_id: dto.business_id,
        name: dto.clientName,
        phone: dto.clientPhone,
        email: dto.clientEmail,
        source: 'call',
      };

      try {
        contact = await this.contactService.create(createContactDto);
        this.logger.log(`✅ Contacto creado automáticamente: ${contact.id} - ${contact.name}`);
      } catch (error) {
        // Si falla por duplicado, intentar buscar nuevamente
        if (error instanceof Error && (error.message.includes('ya existe') || error.message.includes('Conflict'))) {
          contact = await this.contactService.findByEmailOrPhone(
            dto.business_id,
            dto.clientEmail,
            dto.clientPhone,
          );
        } else {
          this.logger.error('Error creando contacto:', error);
          throw error;
        }
      }
    }

    // Crear el appointment con el contact_id
    const createAppointmentDto: CreateAppointmentDto = {
      clientName: dto.clientName,
      clientPhone: dto.clientPhone,
      clientEmail: dto.clientEmail,
      serviceType: dto.serviceType,
      appointmentDate: dto.appointmentDate,
      appointmentTime: dto.appointmentTime,
      notes: dto.notes,
      voiceInteractionId: dto.voiceInteractionId,
    };

    const appointment = this.appointmentRepository.create(createAppointmentDto);
    const savedAppointment = await this.appointmentRepository.save(appointment);

    // Asignar contact_id al appointment
    savedAppointment.contactId = contact.id;
    
    // Si n8n ya creó el evento en Google Calendar, usar ese ID
    // (n8n maneja Google Calendar directamente, la API solo guarda datos)
    if (dto.googleCalendarEventId) {
      savedAppointment.googleCalendarEventId = dto.googleCalendarEventId;
      this.logger.log(`✅ Usando Google Calendar Event ID proporcionado por n8n: ${dto.googleCalendarEventId}`);
    }
    // Si no se proporciona googleCalendarEventId, significa que n8n no creó el evento
    // o que se está llamando desde otro lugar. En ese caso, NO creamos el evento aquí
    // porque n8n es responsable de crear eventos en Google Calendar
    
    await this.appointmentRepository.save(savedAppointment);

    this.logger.log(
      `✅ Appointment creado con contacto: ${savedAppointment.id} - Contact: ${contact.id}`,
    );

    return savedAppointment;
  }
}

