import { Injectable } from '@nestjs/common';
import { ContactService } from './contact.service';
import { TagService } from './tag.service';
import { ContactImportRow, ImportResult } from './dto/import-contacts.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class ContactImportService {
  constructor(
    private readonly contactService: ContactService,
    private readonly tagService: TagService,
  ) {}

  async importFromFile(
    businessId: string,
    fileBuffer: Buffer,
    filename: string,
  ): Promise<ImportResult> {
    const result: ImportResult = {
      total: 0,
      created: 0,
      updated: 0,
      errors: [],
    };

    try {
      // Parsear archivo (CSV o Excel)
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convertir a JSON (mapear nombres de columnas españoles)
      const rawData: any[] = XLSX.utils.sheet_to_json(worksheet, {
        defval: '',
      });

      result.total = rawData.length;

      // Procesar cada fila
      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        const rowNumber = i + 2; // +2 porque Excel empieza en 1 y row 1 es header

        try {
          // Mapear columnas (soportar variaciones de nombres)
          const contactData: ContactImportRow = {
            nombre: row['Nombre'] || row['nombre'] || row['Name'] || '',
            telefono: row['Teléfono'] || row['Telefono'] || row['telefono'] || row['Phone'] || '',
            email: row['Email'] || row['email'] || row['E-mail'] || '',
            fuente: row['Fuente'] || row['fuente'] || row['Source'] || 'manual',
            notas: row['Notas'] || row['notas'] || row['Notes'] || '',
            etiquetas: row['Etiquetas'] || row['etiquetas'] || row['Tags'] || '',
          };

          // Validar datos requeridos
          if (!contactData.nombre || contactData.nombre.trim() === '') {
            throw new Error('El nombre es requerido');
          }

          if (!contactData.telefono || contactData.telefono.trim() === '') {
            throw new Error('El teléfono es requerido');
          }

          // Validar formato de teléfono
          const phone = this.normalizePhone(contactData.telefono);
          if (!this.isValidPhone(phone)) {
            throw new Error('Formato de teléfono inválido. Debe incluir código de país (+54, +1, etc.)');
          }

          // Validar email si existe
          if (contactData.email && !this.isValidEmail(contactData.email)) {
            throw new Error('Formato de email inválido');
          }

          // Validar fuente
          const validSources = ['call', 'whatsapp', 'instagram', 'facebook', 'web', 'manual'];
          if (contactData.fuente && !validSources.includes(contactData.fuente)) {
            throw new Error(`Fuente inválida. Valores permitidos: ${validSources.join(', ')}`);
          }

          // Crear o actualizar contacto
          const { isNew } = await this.contactService.createOrUpdateFromConversation({
            business_id: businessId,
            name: contactData.nombre.trim(),
            phone: phone,
            email: contactData.email?.trim() || undefined,
            source: (contactData.fuente as any) || 'manual',
            notes: contactData.notas?.trim() || undefined,
          });

          if (isNew) {
            result.created++;
          } else {
            result.updated++;
          }

          // Procesar etiquetas
          if (contactData.etiquetas && contactData.etiquetas.trim()) {
            const tagLabels = contactData.etiquetas
              .split(',')
              .map((t) => t.trim())
              .filter((t) => t);

            const contact = await this.contactService.findByPhoneAndBusiness(
              businessId,
              phone,
            );

            if (contact) {
              for (const tagLabel of tagLabels) {
                try {
                  await this.tagService.assignTagToContactByLabel(
                    contact.id,
                    businessId,
                    tagLabel,
                    'blue', // Color por defecto
                    '📌', // Icono por defecto
                  );
                } catch (err) {
                  console.warn(`No se pudo asignar tag "${tagLabel}":`, err);
                }
              }
            }
          }
        } catch (error: any) {
          result.errors.push({
            row: rowNumber,
            data: row,
            error: error.message || 'Error desconocido',
          });
        }
      }

      console.log(`✅ Importación completada: ${result.created} creados, ${result.updated} actualizados, ${result.errors.length} errores`);
      return result;
    } catch (error: any) {
      console.error('Error en importación:', error);
      throw new Error(`Error al procesar archivo: ${error.message}`);
    }
  }

  async exportToExcel(
    businessId: string,
    search?: string,
    tags?: string[],
    source?: string,
  ): Promise<Buffer> {
    // Obtener todos los contactos (sin paginación para exportar todo)
    const { data: contacts } = await this.contactService.findAll(
      businessId,
      1,
      10000, // Límite alto para exportar todo
      search,
      tags,
      source,
    );

    // Preparar datos para Excel
    const exportData = contacts.map((contact) => ({
      Nombre: contact.name,
      Teléfono: contact.phone,
      Email: contact.email || '',
      Fuente: contact.source,
      Notas: contact.notes || '',
      Etiquetas: contact.contactTags
        ?.map((ct) => ct.tag.label)
        .join(', ') || '',
      'Total Interacciones': contact.total_interactions,
      'Última Interacción': contact.last_interaction
        ? new Date(contact.last_interaction).toLocaleString('es-AR')
        : '',
      'Fecha Creación': new Date(contact.created_at).toLocaleString('es-AR'),
    }));

    // Crear workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contactos');

    // Ajustar ancho de columnas
    const maxWidth = 30;
    worksheet['!cols'] = [
      { wch: 25 }, // Nombre
      { wch: 20 }, // Teléfono
      { wch: 30 }, // Email
      { wch: 15 }, // Fuente
      { wch: maxWidth }, // Notas
      { wch: 25 }, // Etiquetas
      { wch: 15 }, // Total Interacciones
      { wch: 20 }, // Última Interacción
      { wch: 20 }, // Fecha Creación
    ];

    // Generar buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }

  async generateTemplate(): Promise<Buffer> {
    const templateData = [
      {
        Nombre: 'María González',
        Teléfono: '+5491154686272',
        Email: 'maria@example.com',
        Fuente: 'whatsapp',
        Notas: 'Cliente interesada en masajes',
        Etiquetas: 'Posible Huésp,VIP',
      },
      {
        Nombre: 'Juan Pérez',
        Teléfono: '+5491143308334',
        Email: 'juan@example.com',
        Fuente: 'call',
        Notas: 'Consulta por precios',
        Etiquetas: 'Consulta',
      },
      {
        Nombre: 'Ana Rodríguez',
        Teléfono: '+5491158177898',
        Email: '',
        Fuente: 'instagram',
        Notas: 'Reserva para dos personas',
        Etiquetas: 'Posible Huésp,Instagram',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla Contactos');

    // Ajustar ancho de columnas
    worksheet['!cols'] = [
      { wch: 25 },
      { wch: 20 },
      { wch: 30 },
      { wch: 15 },
      { wch: 30 },
      { wch: 25 },
    ];

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }

  // Helpers de validación
  private normalizePhone(phone: string): string {
    // Quitar espacios y guiones
    return phone.replace(/[\s-]/g, '');
  }

  private isValidPhone(phone: string): boolean {
    // Debe empezar con + y tener entre 8 y 20 caracteres
    return /^\+\d{8,20}$/.test(phone);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}



