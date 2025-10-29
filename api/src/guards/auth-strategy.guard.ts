import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
    handleRequest(err: any, user: any, info: any, context: any, status?: any) {
        if (!user) {
            throw new HttpException(err || info, HttpStatus.UNAUTHORIZED);
        }
        return user;
    }
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
    handleRequest(err: any, user: any, info: any, context: any, status?: any) {
        // Solo lanzar error si hay un error explícito durante el callback
        if (err) {
            throw new HttpException(err || info, HttpStatus.UNAUTHORIZED);
        }
        
        // Permitir que Passport maneje el flujo automáticamente
        return user;
    }
}

