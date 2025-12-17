import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport';

@Injectable()
export class PublicStrategy extends PassportStrategy(Strategy, 'public') {
  constructor() {
    super();
  }

  async validate(): Promise<any> {
    // Esta estrategia siempre permite el acceso sin validación
    // Retorna un objeto vacío o null para indicar que no hay usuario autenticado
    return null;
  }
}

