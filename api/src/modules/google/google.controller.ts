import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GoogleService } from './google.service';
import { GoogleCalendarEventDto, GoogleIntegrationStatusDto } from './dto';
import { AuthGuard } from '../../guards/auth.guard';
import { AuthUser } from '../../decorators/auth-user.decorator';

@ApiTags('google')
@Controller('google')
@UseGuards(AuthGuard())
@ApiBearerAuth()
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  @Get('calendar/events')
  @ApiOperation({ summary: 'Obtener eventos de Google Calendar' })
  @ApiResponse({ status: 200, description: 'Eventos obtenidos exitosamente', type: [GoogleCalendarEventDto] })
  async getCalendarEvents(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @AuthUser() user?: any,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    
    return this.googleService.getCalendarEvents(start, end);
  }

  @Get('status')
  @ApiOperation({ summary: 'Obtener estado de integración con Google' })
  @ApiResponse({ status: 200, description: 'Estado de integración', type: GoogleIntegrationStatusDto })
  async getIntegrationStatus(@AuthUser() user?: any) {
    try {
      // Verificar conexión con Calendar
      const calendarEvents = await this.googleService.getCalendarEvents();
      const calendarConnected = Array.isArray(calendarEvents);

      return {
        calendarConnected,
        sheetsConnected: true, // Asumimos que está conectado si llegamos aquí
        lastSync: new Date(),
        message: calendarConnected 
          ? 'Integración con Google funcionando correctamente'
          : 'Problemas con la integración de Google Calendar',
      };
    } catch (error) {
      return {
        calendarConnected: false,
        sheetsConnected: false,
        lastSync: new Date(),
        message: 'Error en la integración con Google',
      };
    }
  }

  @Get('calendar/availability')
  @ApiOperation({ summary: 'Obtener slots disponibles para una fecha' })
  @ApiResponse({ status: 200, description: 'Slots disponibles obtenidos exitosamente' })
  async getAvailableSlots(
    @Query('date') date: string,
    @Query('duration') duration?: number,
    @AuthUser() user?: any,
  ) {
    return this.googleService.getAvailableSlots(date, duration);
  }

  @Get('calendar/check-availability')
  @ApiOperation({ summary: 'Verificar disponibilidad de un slot específico' })
  @ApiResponse({ status: 200, description: 'Disponibilidad verificada' })
  async checkAvailability(
    @Query('date') date: string,
    @Query('time') time: string,
    @Query('duration') duration?: number,
    @AuthUser() user?: any,
  ) {
    const isAvailable = await this.googleService.checkAvailability(date, time, duration);
    return { available: isAvailable, date, time, duration: duration || 60 };
  }
}

