import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BusinessService } from '../services/business.service';
import { CreateBusinessDto, UpdateBusinessDto } from '../dto/business.dto';
import { CreateBusinessUserDto, UpdateBusinessUserDto, InviteUserDto } from '../dto/business-user.dto';
import { Auth } from '../../../decorators/http.decorators';
import { AuthUser } from '../../../decorators/auth-user.decorator';
import { RoleType } from '../../../constants/role-type';
import { UserDto } from '../../user/dto/user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('businesses')
@ApiTags('businesses')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  @Auth([RoleType.ADMIN, RoleType.USER])
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create business',
    description: 'Create a new business. The authenticated user will be set as the owner.'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Business created successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Salón de Belleza María',
        phone_number: '+5491123456789',
        description: 'Salón de belleza especializado en cortes modernos y coloración',
        email: 'contacto@salonmaria.com',
        address: 'Av. Corrientes 1234, Buenos Aires, Argentina',
        website: 'https://www.salonmaria.com',
        industry: 'Belleza y Estética',
        ai_prompt: 'Eres un asistente virtual de un salón de belleza...',
        owner_id: '123e4567-e89b-12d3-a456-426614174001',
        created_at: '2025-12-11T10:00:00.000Z',
        updated_at: '2025-12-11T10:00:00.000Z'
      }
    }
  })
  create(@AuthUser() user: UserDto, @Body() createBusinessDto: CreateBusinessDto) {
    return this.businessService.create(createBusinessDto, user.id);
  }

  @Get()
  @Auth([RoleType.ADMIN, RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Find all businesses',
    description: 'Get all businesses associated with the authenticated user'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of businesses retrieved successfully',
    schema: {
      type: 'array',
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Salón de Belleza María',
          phone_number: '+5491123456789',
          industry: 'Belleza y Estética',
          owner_id: '123e4567-e89b-12d3-a456-426614174001',
          created_at: '2025-12-11T10:00:00.000Z'
        }
      ]
    }
  })
  findAll(@AuthUser() user: UserDto) {
    return this.businessService.findAll(user.id);
  }

  @Get(':id')
  @Auth([RoleType.ADMIN, RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get business by ID',
    description: 'Get detailed information about a specific business by its ID. User must be associated with the business.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Business retrieved successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Salón de Belleza María',
        phone_number: '+5491123456789',
        description: 'Salón de belleza especializado en cortes modernos y coloración',
        email: 'contacto@salonmaria.com',
        address: 'Av. Corrientes 1234, Buenos Aires, Argentina',
        website: 'https://www.salonmaria.com',
        industry: 'Belleza y Estética',
        ai_prompt: 'Eres un asistente virtual...',
        ai_voice_id: '21m00Tcm4TlvDq8ikWAM',
        ai_language: 'es',
        assistant_id: 'asst_abc123xyz',
        status: 'active',
        owner_id: '123e4567-e89b-12d3-a456-426614174001',
        created_at: '2025-12-11T10:00:00.000Z',
        updated_at: '2025-12-11T10:00:00.000Z'
      }
    }
  })
  findOne(@Param('id') id: string, @AuthUser() user: UserDto) {
    return this.businessService.findOne(id, user.id);
  }

  @Patch(':id')
  @Auth([RoleType.ADMIN, RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update business',
    description: 'Update a business (owner only)'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Business updated successfully'
  })
  update(@Param('id') id: string, @Body() updateBusinessDto: UpdateBusinessDto, @AuthUser() user: UserDto) {
    return this.businessService.update(id, updateBusinessDto, user.id);
  }

  @Delete(':id')
  @Auth([RoleType.ADMIN, RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete business',
    description: 'Delete a business (owner only)'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Business deleted successfully'
  })
  remove(@Param('id') id: string, @AuthUser() user: UserDto) {
    return this.businessService.remove(id, user.id);
  }

  // Rutas para gestión de usuarios del negocio
  @Post(':id/users')
  @Auth([RoleType.ADMIN, RoleType.USER])
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add user to business',
    description: 'Add a new user to a business (admin only)'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User added to business successfully'
  })
  addUser(@Param('id') id: string, @Body() inviteUserDto: InviteUserDto, @AuthUser() user: UserDto) {
    return this.businessService.addUser(id, inviteUserDto, user.id);
  }

  @Get(':id/users')
  @Auth([RoleType.ADMIN, RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get business users',
    description: 'Get all users of a business (admin only)'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Business users retrieved successfully'
  })
  getBusinessUsers(@Param('id') id: string, @AuthUser() user: UserDto) {
    return this.businessService.getBusinessUsers(id, user.id);
  }

  @Patch(':id/users/:userId')
  @Auth([RoleType.ADMIN, RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update business user',
    description: 'Update a user in a business (admin only)'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Business user updated successfully'
  })
  updateUser(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateBusinessUserDto,
    @AuthUser() user: UserDto
  ) {
    return this.businessService.updateUser(id, userId, updateUserDto, user.id);
  }

  @Delete(':id/users/:userId')
  @Auth([RoleType.ADMIN, RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove user from business',
    description: 'Remove a user from a business (admin only)'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User removed from business successfully'
  })
  removeUser(@Param('id') id: string, @Param('userId') userId: string, @AuthUser() user: UserDto) {
    return this.businessService.removeUser(id, userId, user.id);
  }

  // Eliminar asistente de un business (BD + Vapi + Tools)
  @Delete(':id/assistant')
  @Auth([RoleType.ADMIN, RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete business assistant',
    description: 'Delete the assistant associated with a business (removes from DB, Vapi, and all Vapi tools)'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Assistant deleted successfully from DB and Vapi'
  })
  deleteAssistant(@Param('id') id: string, @AuthUser() user: UserDto) {
    return this.businessService.deleteAssistant(id, user.id);
  }

  // Ruta pública para encontrar negocio por número telefónico (para webhooks)
  @Get('by-phone/:phoneNumber')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Find business by phone number',
    description: 'Find a business by its phone number (public endpoint for webhooks)'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Business found by phone number'
  })
  findByPhoneNumber(@Param('phoneNumber') phoneNumber: string) {
    return this.businessService.findByPhoneNumber(phoneNumber);
  }
}
