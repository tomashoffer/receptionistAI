import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { can, BusinessRole } from '../../../constants/business-permissions';

export const RequirePermission = (permission: string) => SetMetadata('permission', permission);

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.get<string>('permission', context.getHandler());
    
    if (!requiredPermission) {
      return true; // No permission required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    const userRole = user.role as BusinessRole;
    
    if (!can(userRole, requiredPermission)) {
      throw new ForbiddenException(`No tienes permisos para realizar esta acción: ${requiredPermission}`);
    }

    return true;
  }
}
