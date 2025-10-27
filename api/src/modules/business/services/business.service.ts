import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business, Industry } from '../entities/business.entity';
import { BusinessUser, UserRole } from '../entities/business-user.entity';
import { CreateBusinessDto, UpdateBusinessDto } from '../dto/business.dto';
import { CreateBusinessUserDto, UpdateBusinessUserDto, InviteUserDto } from '../dto/business-user.dto';

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    @InjectRepository(BusinessUser)
    private businessUserRepository: Repository<BusinessUser>,
  ) {}

  async create(createBusinessDto: CreateBusinessDto, ownerId: string): Promise<Business> {
    // Verificar que el número telefónico no esté en uso
    const existingBusiness = await this.businessRepository.findOne({
      where: { phone_number: createBusinessDto.phone_number }
    });

    if (existingBusiness) {
      throw new ConflictException('El número telefónico ya está en uso');
    }

    // Mapear industry string a enum
    const industryMapping: Record<string, Industry> = {
      'hair_salon': Industry.HAIR_SALON,
      'restaurant': Industry.RESTAURANT,
      'medical_clinic': Industry.MEDICAL_CLINIC,
      'dental_clinic': Industry.DENTAL_CLINIC,
      'fitness_center': Industry.FITNESS_CENTER,
      'beauty_salon': Industry.BEAUTY_SALON,
      'law_firm': Industry.LAW_FIRM,
      'consulting': Industry.CONSULTING,
      'real_estate': Industry.REAL_ESTATE,
      'automotive': Industry.AUTOMOTIVE,
      'other': Industry.OTHER,
    };

    // Crear el negocio
    const business = new Business();
    business.owner_id = ownerId;
    business.name = createBusinessDto.name;
    business.phone_number = createBusinessDto.phone_number;
    business.industry = industryMapping[createBusinessDto.industry] || Industry.OTHER;
    // AI configuration is now handled in the Assistant table
    // business.ai_prompt = createBusinessDto.ai_prompt;
    if (createBusinessDto.description) business.description = createBusinessDto.description;
    if (createBusinessDto.email) business.email = createBusinessDto.email;
    if (createBusinessDto.address) business.address = createBusinessDto.address;
    if (createBusinessDto.website) business.website = createBusinessDto.website;

    const savedBusiness = await this.businessRepository.save(business);

    // Crear el usuario owner del negocio
    const businessUser = this.businessUserRepository.create({
      business_id: savedBusiness.id,
      user_id: ownerId,
      role: UserRole.OWNER,
      first_name: 'Owner',
      last_name: 'User',
      email: 'owner@example.com', // Esto debería venir del usuario autenticado
    });

    await this.businessUserRepository.save(businessUser);

    return savedBusiness;
  }

  async findAll(ownerId: string): Promise<Business[]> {
    return this.businessRepository.find({
      where: { owner_id: ownerId },
      relations: ['users', 'plan', 'assistant'],
    });
  }

  async findOne(id: string, ownerId: string): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { id, owner_id: ownerId },
      relations: ['users', 'plan', 'call_logs', 'assistant'],
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    return business;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { phone_number: phoneNumber },
      relations: ['plan'],
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado para este número');
    }

    return business;
  }

  async update(id: string, updateBusinessDto: UpdateBusinessDto, ownerId: string): Promise<Business> {
    const business = await this.findOne(id, ownerId);

    // Si se está actualizando el número telefónico, verificar que no esté en uso
    // TODO: Descomentar cuando UpdateBusinessDto incluya phone_number
    // if (updateBusinessDto.phone_number && updateBusinessDto.phone_number !== business.phone_number) {
    //   const existingBusiness = await this.businessRepository.findOne({
    //     where: { phone_number: updateBusinessDto.phone_number }
    //   });

    //   if (existingBusiness) {
    //     throw new ConflictException('El número telefónico ya está en uso');
    //   }
    // }

    Object.assign(business, updateBusinessDto);
    const savedBusiness = await this.businessRepository.save(business);
    
    // Devolver el business completo con todas las relaciones actualizadas
    const updatedBusiness = await this.businessRepository.findOne({
      where: { id, owner_id: ownerId },
      relations: ['users', 'plan', 'call_logs', 'assistant'],
    });
    
    if (!updatedBusiness) {
      throw new NotFoundException('Negocio no encontrado después de la actualización');
    }
    
    return updatedBusiness;
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const business = await this.findOne(id, ownerId);
    await this.businessRepository.remove(business);
  }

  // Métodos para gestión de usuarios del negocio
  async addUser(businessId: string, inviteUserDto: InviteUserDto, ownerId: string): Promise<BusinessUser> {
    const business = await this.findOne(businessId, ownerId);

    // Verificar que el usuario no esté ya en el negocio
    const existingUser = await this.businessUserRepository.findOne({
      where: { 
        business_id: businessId,
        email: inviteUserDto.email 
      }
    });

    if (existingUser) {
      throw new ConflictException('El usuario ya está en este negocio');
    }

    const businessUser = this.businessUserRepository.create({
      business_id: businessId,
      user_id: null, // Se asignará cuando el usuario se registre
      role: inviteUserDto.role,
      first_name: inviteUserDto.first_name,
      last_name: inviteUserDto.last_name,
      email: inviteUserDto.email,
    });

    return this.businessUserRepository.save(businessUser);
  }

  async updateUser(businessId: string, userId: string, updateUserDto: UpdateBusinessUserDto, ownerId: string): Promise<BusinessUser> {
    await this.findOne(businessId, ownerId); // Verificar que el owner tenga acceso

    const businessUser = await this.businessUserRepository.findOne({
      where: { id: userId, business_id: businessId }
    });

    if (!businessUser) {
      throw new NotFoundException('Usuario del negocio no encontrado');
    }

    Object.assign(businessUser, updateUserDto);
    return this.businessUserRepository.save(businessUser);
  }

  async removeUser(businessId: string, userId: string, ownerId: string): Promise<void> {
    await this.findOne(businessId, ownerId); // Verificar que el owner tenga acceso

    const businessUser = await this.businessUserRepository.findOne({
      where: { id: userId, business_id: businessId }
    });

    if (!businessUser) {
      throw new NotFoundException('Usuario del negocio no encontrado');
    }

    await this.businessUserRepository.remove(businessUser);
  }

  async getBusinessUsers(businessId: string, ownerId: string): Promise<BusinessUser[]> {
    await this.findOne(businessId, ownerId); // Verificar que el owner tenga acceso

    return this.businessUserRepository.find({
      where: { business_id: businessId },
      relations: ['business'],
    });
  }
}
