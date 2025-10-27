import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class BusinessContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const businessContext = request.businessContext;

    return next.handle().pipe(
      map(data => {
        // Agregar información del negocio a la respuesta
        if (businessContext && typeof data === 'object') {
          return {
            ...data,
            business_context: {
              business_id: businessContext.business.id,
              business_name: businessContext.business.name,
              user_role: businessContext.businessUser.role,
              permissions: businessContext.permissions,
            },
          };
        }
        return data;
      }),
    );
  }
}
