import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessUser, UserRole } from '../../business/entities/business-user.entity';
import { Business, Industry } from '../../business/entities/business.entity';
import { BusinessPlan } from '../../business/entities/business-plan.entity';
import { UserEntity } from '../../user/user.entity';
import { RegisterDto } from '../dto/auth.dto';
import { RoleType } from '../../../constants/role-type';
import * as bcrypt from 'bcrypt';
import { getUserPermissions } from '../../../constants/business-permissions';

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role?: string;
    permissions?: string[];
    businesses: Array<{
      id: string;
      name: string;
      role: string;
      status: string;
    }>;
  };
}

export interface BusinessSelectionResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    business_id: string;
    business_name: string;
    role: string;
    permissions: string[];
  };
}

@Injectable()
export class MultitenantAuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(BusinessUser)
    private businessUserRepository: Repository<BusinessUser>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    @InjectRepository(BusinessPlan)
    private businessPlanRepository: Repository<BusinessPlan>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    // Aquí deberías validar contra tu tabla de usuarios principal
    // Por ahora simulamos la validación
    const user = {
      id: 'user-uuid',
      email: email,
      password_hash: '$2b$10$example_hash', // Hash de ejemplo
    };

    if (user && await bcrypt.compare(password, user.password_hash)) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await this.validateUser(email, password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Obtener el negocio del usuario (asumimos UN SOLO NEGOCIO por usuario)
    const businessUser = await this.businessUserRepository.findOne({
      where: { 
        user_id: user.id,
        is_active: true 
      },
      relations: ['business'],
    });

    if (!businessUser) {
      throw new UnauthorizedException('No tienes un negocio asociado');
    }

    if (businessUser.business.status !== 'active' && businessUser.business.status !== 'trial') {
      throw new UnauthorizedException('Tu negocio no está activo');
    }

    // Generar permisos según el rol
    const permissions = Array.from(getUserPermissions(businessUser.role));

    const payload = {
      sub: user.id,
      email: user.email,
      business_id: businessUser.business.id,
      role: businessUser.role,
      type: 'business_selected',
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: user.id,
        email: user.email,
        first_name: businessUser.first_name,
        last_name: businessUser.last_name,
        role: businessUser.role,
        permissions,
        businesses: [{
          id: businessUser.business.id,
          name: businessUser.business.name,
          role: businessUser.role,
          status: businessUser.business.status,
        }],
      },
    };
  }

  async selectBusiness(userId: string, businessId: string): Promise<BusinessSelectionResponse> {
    // Verificar que el usuario tenga acceso al negocio
    const businessUser = await this.businessUserRepository.findOne({
      where: { 
        user_id: userId,
        business_id: businessId,
        is_active: true 
      },
      relations: ['business'],
    });

    if (!businessUser) {
      throw new UnauthorizedException('No tienes acceso a este negocio');
    }

    if (businessUser.business.status !== 'active' && businessUser.business.status !== 'trial') {
      throw new BadRequestException('El negocio no está activo');
    }

    // Generar permisos según el rol
    const permissions = Array.from(getUserPermissions(businessUser.role));

    const payload = {
      sub: userId,
      email: businessUser.email,
      business_id: businessId,
      role: businessUser.role,
      type: 'business_selected',
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: userId,
        email: businessUser.email,
        first_name: businessUser.first_name,
        last_name: businessUser.last_name,
        business_id: businessId,
        business_name: businessUser.business.name,
        role: businessUser.role,
        permissions,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      
      // Generar nuevo access token
      const newPayload = {
        sub: payload.sub,
        email: payload.email,
        business_id: payload.business_id,
        role: payload.role,
        type: payload.type,
      };

      return {
        access_token: this.jwtService.sign(newPayload),
      };
    } catch (error) {
      throw new UnauthorizedException('Token de refresh inválido');
    }
  }

  async getUserBusinesses(userId: string): Promise<Array<{
    id: string;
    name: string;
    role: string;
    status: string;
    industry: string;
  }>> {
    const businessUsers = await this.businessUserRepository.find({
      where: { 
        user_id: userId,
        is_active: true 
      },
      relations: ['business'],
    });

    return businessUsers.map(bu => ({
      id: bu.business.id,
      name: bu.business.name,
      role: bu.role,
      status: bu.business.status,
      industry: bu.business.industry,
    }));
  }

  async register(registerDto: RegisterDto): Promise<LoginResponse> {
    console.log('🚀 INICIANDO REGISTRO para:', registerDto.email);
    
    const { email, password, first_name, last_name, business_name, business_phone, industry } = registerDto;

    // Verificar si el usuario ya existe
    console.log('🔍 Verificando si usuario existe:', email);
    const existingUser = await this.userRepository.findOne({
      where: { email }
    });

    if (existingUser) {
      console.log('❌ Usuario ya existe:', email);
      throw new ConflictException('El email ya está registrado');
    }

    // Verificar si el número de teléfono ya está en uso
    console.log('🔍 Verificando si teléfono existe:', business_phone);
    const existingBusiness = await this.businessRepository.findOne({
      where: { phone_number: business_phone }
    });

    if (existingBusiness) {
      console.log('❌ Teléfono ya existe:', business_phone);
      throw new ConflictException('El número de teléfono ya está registrado');
    }

    // Hash de la contraseña
    console.log('🔐 Hasheando contraseña...');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Obtener el plan Trial
    console.log('📋 Obteniendo plan Trial...');
    const trialPlan = await this.businessPlanRepository.findOne({
      where: { name: 'Trial' }
    });

    if (!trialPlan) {
      console.log('❌ Plan Trial no encontrado');
      throw new BadRequestException('Plan Trial no encontrado');
    }
    console.log('✅ Plan Trial encontrado:', trialPlan.id);

    // Crear el usuario
    console.log('👤 Creando usuario...');
    const user = this.userRepository.create({
      email,
      password: passwordHash,
      role: RoleType.USER,
    });

    const savedUser = await this.userRepository.save(user);
    console.log('✅ Usuario creado:', savedUser.id);

    // Mapear industry string a enum
    const industryMapping: Record<string, Industry> = {
      'salon': Industry.HAIR_SALON,
      'restaurant': Industry.RESTAURANT,
      'clinic': Industry.MEDICAL_CLINIC,
      'spa': Industry.BEAUTY_SALON,
      'gym': Industry.FITNESS_CENTER,
      'office': Industry.CONSULTING,
      'retail': Industry.AUTOMOTIVE,
      'other': Industry.CONSULTING,
    };

    // Crear el negocio
    const business = new Business();
    business.owner_id = savedUser.id;
    business.name = business_name;
    business.phone_number = business_phone;
    business.industry = industryMapping[industry] || Industry.CONSULTING;
    business.status = 'trial' as any;
    business.plan_id = trialPlan.id;
    // AI configuration is now handled in the Assistant table
    // business.ai_prompt = `Eres el recepcionista AI de ${business_name}. Tu trabajo es atender llamadas telefónicas de manera profesional y amigable.`;
    // business.ai_language = 'es-ES';
    business.business_hours = {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '14:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true },
    };
    business.services = [];

    console.log('🏢 Intentando crear negocio:', business.name, 'para usuario:', savedUser.id);
    
    try {
      const savedBusiness = await this.businessRepository.save(business);
      console.log('✅ Negocio creado:', savedBusiness.id);
      
      // Crear la relación usuario-negocio
      const businessUser = this.businessUserRepository.create({
        business_id: savedBusiness.id,
        user_id: savedUser.id,
        role: UserRole.OWNER,
        first_name,
        last_name,
        email,
        is_active: true,
      });

      await this.businessUserRepository.save(businessUser);
      console.log('✅ Relación usuario-negocio creada');

      // Generar tokens JWT
      const payload = {
        sub: savedUser.id,
        email: savedUser.email,
        business_id: savedBusiness.id,
        role: 'owner',
        type: 'business_selected',
      };

      return {
        access_token: this.jwtService.sign(payload),
        refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
        user: {
          id: savedUser.id,
          email: savedUser.email,
          first_name,
          last_name,
          businesses: [{
            id: savedBusiness.id,
            name: savedBusiness.name,
            role: 'owner',
            status: savedBusiness.status,
          }],
        },
      };
    } catch (error) {
      console.error('❌ Error creando negocio:', error);
      throw error;
    }
  }
}
