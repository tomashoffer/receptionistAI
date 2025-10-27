import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);

// Decoradores específicos para facilitar el uso
export const RequireOwner = () => RequirePermissions('read_business', 'write_business', 'delete_business');
export const RequireAdmin = () => RequirePermissions('read_business', 'write_business', 'manage_users');
export const RequireManager = () => RequirePermissions('read_business', 'write_business', 'view_analytics');
export const RequireStaff = () => RequirePermissions('read_business', 'read_calls');

// Decorador para endpoints públicos (sin autenticación de negocio)
export const PUBLIC_BUSINESS_KEY = 'isPublicBusiness';
export const PublicBusiness = () => SetMetadata(PUBLIC_BUSINESS_KEY, true);
