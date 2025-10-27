import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { BusinessService } from '../services/business.service';

@Injectable()
export class WebhookGuard implements CanActivate {
  constructor(private businessService: BusinessService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Para webhooks de Twilio/VAPI, verificar que el número telefónico existe
    const phoneNumber = this.extractPhoneNumber(request);
    
    if (!phoneNumber) {
      throw new UnauthorizedException('Número telefónico requerido');
    }

    try {
      // Buscar el negocio por número telefónico
      const business = await this.businessService.findByPhoneNumber(phoneNumber);
      
      if (!business) {
        throw new UnauthorizedException('Negocio no encontrado para este número');
      }

      if (business.status !== 'active' && business.status !== 'trial') {
        throw new UnauthorizedException('Negocio inactivo');
      }

      // Agregar información del negocio a la request
      request.businessContext = {
        business: business,
        businessUser: null, // Los webhooks no tienen usuario específico
        permissions: ['webhook_access'],
      };

      request.business_id = business.id;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Acceso denegado al webhook');
    }
  }

  private extractPhoneNumber(request: any): string | null {
    // Intentar obtener el número de diferentes fuentes según el proveedor
    
    // Para Twilio
    if (request.body?.To) {
      return request.body.To;
    }
    
    // Para VAPI
    if (request.body?.called_number) {
      return request.body.called_number;
    }

    // Para webhooks genéricos
    if (request.body?.phone_number) {
      return request.body.phone_number;
    }

    // Desde query parameters
    if (request.query?.phone_number) {
      return request.query.phone_number;
    }

    return null;
  }
}
