import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppointmentEntity } from './appointment.entity';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto';
import { GoogleService } from '../google/google.service';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    @InjectRepository(AppointmentEntity)
    private appointmentRepository: Repository<AppointmentEntity>,
    private googleService: GoogleService,
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
}

