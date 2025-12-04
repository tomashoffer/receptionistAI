import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ContactService } from './contact.service';
import { TagService } from './tag.service';
import { ContactImportService } from './contact-import.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { CreateContactFromConversationDto } from './dto/create-contact-from-conversation.dto';
import { AssignTagsDto } from './dto/assign-tags.dto';
import { JwtAuthGuard } from '../../guards/auth-strategy.guard';

@Controller('contacts')
@UseGuards(JwtAuthGuard)
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    private readonly tagService: TagService,
    private readonly contactImportService: ContactImportService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createContactDto: CreateContactDto) {
    return await this.contactService.create(createContactDto);
  }

  @Get()
  async findAll(
    @Query('business_id') businessId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('search') search?: string,
    @Query('tags') tags?: string,
    @Query('source') source?: string,
  ) {
    const tagArray = tags ? tags.split(',') : undefined;

    return await this.contactService.findAll(
      businessId,
      Number(page),
      Number(limit),
      search,
      tagArray,
      source,
    );
  }

  // ========== RUTAS ESPECÍFICAS ANTES DE :id ==========

  @Get('stats')
  async getStats(@Query('business_id') businessId: string) {
    return await this.contactService.getStats(businessId);
  }

  @Post('from-conversation')
  @HttpCode(HttpStatus.OK)
  async createFromConversation(
    @Body() dto: CreateContactFromConversationDto,
  ) {
    const { contact, isNew } = await this.contactService.createOrUpdateFromConversation(dto);

    // Auto-asignar tags según intención y fuente
    if (dto.intent) {
      await this.autoAssignTags(contact.id, dto.business_id, dto.intent, dto.source);
    }

    return {
      success: true,
      contact_id: contact.id,
      is_new: isNew,
      message: isNew ? 'Nuevo contacto creado' : 'Contacto actualizado',
    };
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  async importContacts(
    @UploadedFile() file: Express.Multer.File,
    @Query('business_id') businessId: string,
  ) {
    if (!file) {
      return { error: 'No se recibió ningún archivo' };
    }

    if (!businessId) {
      return { error: 'business_id es requerido' };
    }

    // Validar tipo de archivo
    const allowedMimes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedMimes.includes(file.mimetype)) {
      return {
        error: 'Formato de archivo no soportado. Use CSV o Excel (.xlsx)',
      };
    }

    // Validar tamaño (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { error: 'El archivo es demasiado grande. Máximo 10MB' };
    }

    const result = await this.contactImportService.importFromFile(
      businessId,
      file.buffer,
      file.originalname,
    );

    return result;
  }

  @Get('export')
  async exportContacts(
    @Query('business_id') businessId: string,
    @Query('search') search?: string,
    @Query('tags') tags?: string,
    @Query('source') source?: string,
    @Res({ passthrough: true }) res?: Response,
  ) {
    if (!businessId) {
      return { error: 'business_id es requerido' };
    }

    const tagArray = tags ? tags.split(',') : undefined;

    const buffer = await this.contactImportService.exportToExcel(
      businessId,
      search,
      tagArray,
      source,
    );

    // Nombre del archivo con fecha
    const date = new Date().toISOString().split('T')[0];
    const filename = `contactos-${date}.xlsx`;

    res?.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    return new StreamableFile(buffer);
  }

  @Get('template')
  async downloadTemplate(@Res({ passthrough: true }) res?: Response) {
    const buffer = await this.contactImportService.generateTemplate();

    res?.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="plantilla-contactos.xlsx"',
      'Content-Length': buffer.length,
    });

    return new StreamableFile(buffer);
  }

  // ========== RUTAS CON PARÁMETROS DINÁMICOS AL FINAL ==========

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('business_id') businessId: string,
  ) {
    return await this.contactService.findOne(id, businessId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Query('business_id') businessId: string,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    return await this.contactService.update(id, businessId, updateContactDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Query('business_id') businessId: string,
  ) {
    await this.contactService.remove(id, businessId);
  }

  // ========== CONTACT TAGS ==========

  @Get(':id/tags')
  async getContactTags(@Param('id') id: string) {
    return await this.tagService.getContactTags(id);
  }

  @Post(':id/tags')
  @HttpCode(HttpStatus.OK)
  async assignTags(
    @Param('id') id: string,
    @Body() assignTagsDto: AssignTagsDto,
  ) {
    return await this.tagService.assignTagsToContact(id, assignTagsDto);
  }

  @Delete(':id/tags/:tagId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeTag(@Param('id') id: string, @Param('tagId') tagId: string) {
    await this.tagService.removeTagFromContact(id, tagId);
  }

  // ========== APPOINTMENTS ==========

  @Get(':id/appointments')
  async getContactAppointments(@Param('id') id: string) {
    return await this.contactService.getContactAppointments(id);
  }

  // ========== HELPERS ==========

  private async autoAssignTags(
    contactId: string,
    businessId: string,
    intent: string,
    source: string,
  ) {
    const tagMappings: Record<string, { label: string; color: string; icon: string }> = {
      'agendar_turno': { label: 'Solicitud de Turno', color: 'blue', icon: '📅' },
      'consulta': { label: 'Consulta', color: 'purple', icon: '❓' },
      'cancelacion': { label: 'Quiere Cancelar', color: 'red', icon: '❌' },
      'reserva': { label: 'Posible Huésp', color: 'orange', icon: '🛏️' },
      'informacion': { label: 'Información', color: 'gray', icon: 'ℹ️' },
    };

    const sourceTags: Record<string, { label: string; color: string; icon: string }> = {
      'call': { label: 'Llamada', color: 'green', icon: '☎️' },
      'whatsapp': { label: 'WhatsApp', color: 'green', icon: '💬' },
      'instagram': { label: 'Instagram', color: 'pink', icon: '📷' },
      'facebook': { label: 'Facebook', color: 'blue', icon: '👥' },
      'web': { label: 'Web', color: 'indigo', icon: '🌐' },
    };

    // Tag según intención
    const intentTag = tagMappings[intent];
    if (intentTag) {
      await this.tagService.assignTagToContactByLabel(
        contactId,
        businessId,
        intentTag.label,
        intentTag.color,
        intentTag.icon,
      );
    }

    // Tag según fuente
    const sourceTag = sourceTags[source];
    if (sourceTag) {
      await this.tagService.assignTagToContactByLabel(
        contactId,
        businessId,
        sourceTag.label,
        sourceTag.color,
        sourceTag.icon,
      );
    }

    // Tag genérico para leads nuevos
    await this.tagService.assignTagToContactByLabel(
      contactId,
      businessId,
      'Lead Entrante',
      'pink',
      '👤',
    );
  }
}

