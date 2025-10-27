import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto, AppointmentResponseDto } from './dto';
import { AuthGuard } from '../../guards/auth.guard';
import { AuthUser } from '../../decorators/auth-user.decorator';
import { Auth } from '../../decorators/http.decorators';
import { RoleType } from '../../constants/role-type';
import { UserDto } from '../user/dto/user.dto';

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Auth([RoleType.ADMIN, RoleType.USER])
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nueva cita' })
  @ApiResponse({ status: 201, description: 'Cita creada exitosamente', type: AppointmentResponseDto })
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  @Auth([RoleType.ADMIN, RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todas las citas' })
  @ApiResponse({ status: 200, description: 'Lista de citas obtenida exitosamente', type: [AppointmentResponseDto] })
  findAll(@Query('status') status?: string) {
    if (status) {
      return this.appointmentsService.findByStatus(status);
    }
    return this.appointmentsService.findAll();
  }

  @Get('range')
  @Auth([RoleType.ADMIN, RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener citas por rango de fechas' })
  @ApiResponse({ status: 200, description: 'Citas en el rango especificado', type: [AppointmentResponseDto] })
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.appointmentsService.findByDateRange(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('available-slots')
  @Auth([RoleType.ADMIN, RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener slots disponibles para una fecha' })
  @ApiResponse({ status: 200, description: 'Slots disponibles obtenidos exitosamente' })
  async getAvailableSlots(
    @Query('date') date: string,
    @Query('duration') duration?: number,
  ) {
    return this.appointmentsService.getAvailableSlots(date, duration);
  }

  @Get('my-appointments')
  @Auth([RoleType.ADMIN, RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener mis citas' })
  @ApiResponse({ status: 200, description: 'Citas del usuario', type: [AppointmentResponseDto] })
  findMyAppointments(@AuthUser() user: UserDto) {
    return this.appointmentsService.findByUserId(user.id);
  }

  @Get(':id')
  @Auth([RoleType.ADMIN, RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener cita por ID' })
  @ApiResponse({ status: 200, description: 'Cita encontrada', type: AppointmentResponseDto })
  @ApiResponse({ status: 404, description: 'Cita no encontrada' })
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id')
  @Auth([RoleType.ADMIN, RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar cita' })
  @ApiResponse({ status: 200, description: 'Cita actualizada exitosamente', type: AppointmentResponseDto })
  @ApiResponse({ status: 404, description: 'Cita no encontrada' })
  update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Delete(':id')
  @Auth([RoleType.ADMIN, RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar cita' })
  @ApiResponse({ status: 200, description: 'Cita eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada' })
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}

