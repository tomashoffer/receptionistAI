import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { AppointmentEntity } from '../appointments/appointment.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { CreateContactFromConversationDto } from './dto/create-contact-from-conversation.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectRepository(AppointmentEntity)
    private readonly appointmentRepository: Repository<AppointmentEntity>,
  ) {}

  async create(createContactDto: CreateContactDto): Promise<Contact> {
    // Verificar si ya existe un contacto con ese teléfono en el business
    const existingByPhone = await this.findByPhoneAndBusiness(
      createContactDto.business_id,
      createContactDto.phone,
    );

    if (existingByPhone) {
      throw new ConflictException(
        `Ya existe un contacto con el teléfono ${createContactDto.phone}`,
      );
    }

    // Verificar si ya existe un contacto con ese email en el business
    if (createContactDto.email) {
      const existingByEmail = await this.contactRepository.findOne({
        where: {
          business_id: createContactDto.business_id,
          email: createContactDto.email,
        },
      });

      if (existingByEmail) {
        throw new ConflictException(
          `Ya existe un contacto con el email ${createContactDto.email}`,
        );
      }
    }

    const contact = this.contactRepository.create(createContactDto);
    return await this.contactRepository.save(contact);
  }

  async findAll(
    businessId: string,
    page: number = 1,
    limit: number = 50,
    search?: string,
    tags?: string[],
    source?: string,
  ): Promise<{ data: Contact[]; total: number; page: number; limit: number }> {
    const query = this.contactRepository
      .createQueryBuilder('contact')
      .leftJoinAndSelect('contact.contactTags', 'contactTags')
      .leftJoinAndSelect('contactTags.tag', 'tag')
      .where('contact.business_id = :businessId', { businessId })
      .orderBy('contact.last_interaction', 'DESC')
      .addOrderBy('contact.created_at', 'DESC');

    // Filtro por búsqueda (nombre, teléfono, email)
    if (search) {
      query.andWhere(
        '(contact.name ILIKE :search OR contact.phone ILIKE :search OR contact.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filtro por fuente
    if (source) {
      query.andWhere('contact.source = :source', { source });
    }

    // Filtro por tags
    if (tags && tags.length > 0) {
      query.andWhere('tag.id IN (:...tags)', { tags });
    }

    // Paginación
    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, businessId: string): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { id, business_id: businessId },
      relations: ['contactTags', 'contactTags.tag'],
    });

    if (!contact) {
      throw new NotFoundException(
        `Contacto con ID ${id} no encontrado en este negocio`,
      );
    }

    return contact;
  }

  async findByPhoneAndBusiness(
    businessId: string,
    phone: string,
  ): Promise<Contact | null> {
    return await this.contactRepository.findOne({
      where: { business_id: businessId, phone },
      relations: ['contactTags', 'contactTags.tag'],
    });
  }

  async findByEmailOrPhone(
    businessId: string,
    email?: string,
    phone?: string,
  ): Promise<Contact | null> {
    if (!email && !phone) {
      return null;
    }

    const whereConditions: any[] = [{ business_id: businessId }];

    if (email && phone) {
      // Buscar por email O teléfono
      whereConditions.push(
        { business_id: businessId, email },
        { business_id: businessId, phone },
      );
    } else if (email) {
      whereConditions[0].email = email;
    } else if (phone) {
      whereConditions[0].phone = phone;
    }

    return await this.contactRepository.findOne({
      where: whereConditions.length > 1 ? whereConditions : whereConditions[0],
      relations: ['contactTags', 'contactTags.tag'],
    });
  }

  async update(
    id: string,
    businessId: string,
    updateContactDto: UpdateContactDto,
  ): Promise<Contact> {
    const contact = await this.findOne(id, businessId);

    Object.assign(contact, updateContactDto);
    return await this.contactRepository.save(contact);
  }

  async remove(id: string, businessId: string): Promise<void> {
    const contact = await this.findOne(id, businessId);
    await this.contactRepository.remove(contact);
  }

  // UPSERT para VAPI - crea o actualiza contacto desde conversación
  async createOrUpdateFromConversation(
    dto: CreateContactFromConversationDto,
  ): Promise<{
    contact: Contact;
    isNew: boolean;
  }> {
    // Buscar contacto existente por teléfono o email
    let contact = await this.findByPhoneAndBusiness(dto.business_id, dto.phone);

    // Si no se encuentra por teléfono pero viene email, buscar por email
    if (!contact && dto.email) {
      contact = await this.contactRepository.findOne({
        where: {
          business_id: dto.business_id,
          email: dto.email,
        },
        relations: ['contactTags', 'contactTags.tag'],
      });
    }

    let isNew = false;

    if (contact) {
      // Actualizar contacto existente
      contact.name = dto.name || contact.name;
      contact.email = dto.email || contact.email;
      contact.phone = dto.phone || contact.phone; // Actualizar teléfono si cambió
      contact.last_interaction = new Date();
      contact.total_interactions = contact.total_interactions + 1;
      contact.last_conversation_summary = dto.notes || contact.last_conversation_summary;
      contact.conversation_id = dto.conversation_id || contact.conversation_id;

      // Actualizar source solo si no estaba definido
      if (!contact.source) {
        contact.source = dto.source;
      }

      await this.contactRepository.save(contact);
      console.log(`✅ Contacto actualizado: ${contact.id} - ${contact.name} (teléfono: ${contact.phone})`);
    } else {
      // Antes de crear, verificar una última vez que no exista un duplicado
      // (esto previene race conditions)
      const duplicateCheck = await this.contactRepository.findOne({
        where: [
          { business_id: dto.business_id, phone: dto.phone },
          ...(dto.email ? [{ business_id: dto.business_id, email: dto.email }] : []),
        ],
        relations: ['contactTags', 'contactTags.tag'],
      });

      if (duplicateCheck) {
        // Si se encontró un duplicado en la verificación final, actualizar
        contact = duplicateCheck;
        contact.name = dto.name || contact.name;
        contact.email = dto.email || contact.email;
        contact.phone = dto.phone || contact.phone;
        contact.last_interaction = new Date();
        contact.total_interactions = contact.total_interactions + 1;
        contact.last_conversation_summary = dto.notes || contact.last_conversation_summary;
        contact.conversation_id = dto.conversation_id || contact.conversation_id;
        await this.contactRepository.save(contact);
        console.log(`✅ Contacto actualizado (duplicado detectado): ${contact.id} - ${contact.name}`);
      } else {
        // Crear nuevo contacto solo si no existe ningún duplicado
        contact = this.contactRepository.create({
          business_id: dto.business_id,
          name: dto.name,
          phone: dto.phone,
          email: dto.email,
          source: dto.source,
          notes: dto.notes,
          last_interaction: new Date(),
          total_interactions: 1,
          last_conversation_summary: dto.notes,
          conversation_id: dto.conversation_id,
        });

        await this.contactRepository.save(contact);
        isNew = true;
        console.log(`✅ Nuevo contacto creado: ${contact.id} - ${contact.name} (teléfono: ${contact.phone})`);
      }
    }

    // Recargar con relaciones
    return {
      contact: await this.findOne(contact.id, dto.business_id),
      isNew,
    };
  }

  // Estadísticas
  async getStats(businessId: string): Promise<{
    total: number;
    bySource: Record<string, number>;
    thisMonth: number;
  }> {
    const total = await this.contactRepository.count({
      where: { business_id: businessId },
    });

    const bySource = await this.contactRepository
      .createQueryBuilder('contact')
      .select('contact.source', 'source')
      .addSelect('COUNT(*)', 'count')
      .where('contact.business_id = :businessId', { businessId })
      .groupBy('contact.source')
      .getRawMany();

    const sourceMap = bySource.reduce(
      (acc, { source, count }) => {
        acc[source] = parseInt(count);
        return acc;
      },
      {} as Record<string, number>,
    );

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonth = await this.contactRepository.count({
      where: {
        business_id: businessId,
      },
    });

    return {
      total,
      bySource: sourceMap,
      thisMonth,
    };
  }

  // Obtener appointments de un contacto
  async getContactAppointments(contactId: string) {
    const appointments = await this.appointmentRepository.find({
      where: { contactId },
      order: { appointmentDate: 'DESC', appointmentTime: 'DESC' },
    });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Separar en pasados y futuros
    const pastAppointments = appointments.filter((apt) => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate < today;
    });

    const upcomingAppointments = appointments.filter((apt) => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate >= today;
    });

    return {
      all: appointments,
      past: pastAppointments,
      upcoming: upcomingAppointments,
      last: pastAppointments[0] || null,
      next: upcomingAppointments[0] || null,
      total: appointments.length,
    };
  }
}

