import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BusinessService } from '../services/business.service';
import { BusinessUser } from '../entities/business-user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

export interface AuthenticatedUser {
  id: string;
  email: string;
  business_id?: string;
  role?: string;
}

export interface BusinessContext {
  business: any;
  businessUser: BusinessUser;
  permissions: string[];
}

@Injectable()
export class BusinessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private businessService: BusinessService,
    @InjectRepository(BusinessUser)
    private businessUserRepository: Repository<BusinessUser>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser = request.user;

    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    // Obtener business_id de la URL o del usuario
    const businessId = this.extractBusinessId(request, user);
    
    if (!businessId) {
      throw new ForbiddenException('Business ID requerido');
    }

    // Verificar que el usuario tenga acceso al negocio
    const businessUser = await this.businessUserRepository.findOne({
      where: { 
        business_id: businessId,
        user_id: user.id,
        is_active: true 
      },
      relations: ['business'],
    });

    if (!businessUser) {
      throw new ForbiddenException('No tienes acceso a este negocio');
    }

    // Verificar permisos específicos si están definidos
    const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler());
    if (requiredPermissions) {
      const userPermissions = this.getUserPermissions(businessUser.role);
      const hasPermission = requiredPermissions.some(permission => 
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        throw new ForbiddenException('Permisos insuficientes');
      }
    }

    // Agregar contexto del negocio a la request
    request.businessContext = {
      business: businessUser.business,
      businessUser: businessUser,
      permissions: this.getUserPermissions(businessUser.role),
    };

    // Agregar business_id al usuario para uso posterior
    request.user.business_id = businessId;
    request.user.role = businessUser.role;

    return true;
  }

  private extractBusinessId(request: any, user: AuthenticatedUser): string | null {
    // 1. Intentar obtener de la URL (ej: /business/:businessId/...)
    const urlBusinessId = request.params?.businessId;
    if (urlBusinessId) {
      return urlBusinessId;
    }

    // 2. Intentar obtener del query parameter
    const queryBusinessId = request.query?.business_id;
    if (queryBusinessId) {
      return queryBusinessId;
    }

    // 3. Intentar obtener del body
    const bodyBusinessId = request.body?.business_id;
    if (bodyBusinessId) {
      return bodyBusinessId;
    }

    // 4. Usar el business_id del usuario si está disponible
    if (user.business_id) {
      return user.business_id;
    }

    return null;
  }

  private getUserPermissions(role: string): string[] {
    const permissions = {
      owner: [
        'read_business',
        'write_business',
        'delete_business',
        'manage_users',
        'manage_integrations',
        'view_analytics',
        'manage_billing',
        'read_calls',
        'write_calls',
      ],
      admin: [
        'read_business',
        'write_business',
        'manage_users',
        'manage_integrations',
        'view_analytics',
        'read_calls',
        'write_calls',
      ],
      manager: [
        'read_business',
        'write_business',
        'view_analytics',
        'read_calls',
        'write_calls',
      ],
      staff: [
        'read_business',
        'read_calls',
      ],
    };

    return permissions[role] || [];
  }
}
