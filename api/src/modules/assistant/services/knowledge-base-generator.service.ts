import { Injectable } from '@nestjs/common';
import { AssistantConfiguration } from '../entities/assistant-configuration.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

@Injectable()
export class KnowledgeBaseGeneratorService {
  
  /**
   * Genera contenido Markdown para precio_disponibilidad
   */
  generatePrecioDisponibilidad(config: AssistantConfiguration): string {
    const data = config.config_data?.precioDisponibilidad;
    if (!data) return '';

    let content = '# PRECIO Y DISPONIBILIDAD\n\n';

    // Secciones de preguntas
    if (data.secciones && Array.isArray(data.secciones)) {
      data.secciones.forEach((section: any) => {
        content += `## ${section.title}\n\n`;
        
        if (section.questions && Array.isArray(section.questions)) {
          section.questions.forEach((q: any) => {
            content += `### ${q.pregunta}\n\n`;
            content += `Respuesta: ${q.respuesta || q.defaultValue || 'No especificado'}\n\n`;
          });
        }
      });
    }

    // Situaciones
    if (data.situaciones && Array.isArray(data.situaciones)) {
      content += '# SITUACIONES EN LAS QUE EL ASISTENTE DEBE DETENERSE\n\n';
      data.situaciones.forEach((sit: any, index: number) => {
        content += `${index + 1}. ${sit.titulo}\n\n`;
        content += `   Descripción: ${sit.descripcion || ''}\n\n`;
      });
    }

    // Configuración avanzada
    if (data.configAvanzada) {
      content += '# CONFIGURACIÓN AVANZADA\n\n';
      content += `- Detenerse en cotización: ${data.configAvanzada.detenerseCotizacion ? 'Sí' : 'No'}\n`;
      content += `- Total mínimo: ${data.configAvanzada.totalMinimo || 'No especificado'}\n`;
      content += `- Instrucciones de cálculo: ${data.configAvanzada.instruccionesCalculo || 'No especificado'}\n`;
      content += `- Mensaje fijo: ${data.configAvanzada.mensajeFijo || 'No especificado'}\n`;
    }

    return content;
  }

  /**
   * Genera contenido Markdown para informacion_establecimiento
   */
  generateInformacionEstablecimiento(config: AssistantConfiguration): string {
    const data = config.config_data?.informacionEstablecimiento;
    if (!data) return '';

    let content = '# INFORMACIÓN DEL ESTABLECIMIENTO\n\n';

    // Iterar sobre todas las secciones
    Object.keys(data).forEach((sectionKey) => {
      if (sectionKey === 'situaciones' || sectionKey === 'revisadoData') return;
      
      const section = data[sectionKey];
      if (section?.title) {
        content += `## ${section.title}\n\n`;
        
        if (section.questions && Array.isArray(section.questions)) {
          section.questions.forEach((q: any) => {
            content += `### ${q.pregunta}\n\n`;
            content += `Respuesta: ${q.respuesta || q.defaultValue || 'No especificado'}\n\n`;
          });
        }
      }
    });

    // Situaciones
    if (data.situaciones && Array.isArray(data.situaciones)) {
      content += '# SITUACIONES EN LAS QUE EL ASISTENTE DEBE DETENERSE\n\n';
      data.situaciones.forEach((sit: any, index: number) => {
        content += `${index + 1}. ${sit.titulo}\n\n`;
        content += `   Descripción: ${sit.descripcion || ''}\n\n`;
      });
    }

    return content;
  }

  /**
   * Genera contenido Markdown para informacion_extra
   */
  generateInformacionExtra(config: AssistantConfiguration): string {
    const data = config.config_data?.informacionExtra;
    if (!data) return '';

    let content = '# INFORMACIÓN EXTRA\n\n';

    Object.keys(data).forEach((sectionKey) => {
      if (sectionKey === 'revisadoData') return;
      
      const section = data[sectionKey];
      if (section?.title) {
        content += `## ${section.title}\n\n`;
        
        if (section.questions && Array.isArray(section.questions)) {
          section.questions.forEach((q: any) => {
            content += `### ${q.pregunta}\n\n`;
            content += `Respuesta: ${q.respuesta || q.defaultValue || 'No especificado'}\n\n`;
          });
        }
      }
    });

    return content;
  }

  /**
   * Genera JSON para integracion_fotos
   */
  generateIntegracionFotos(config: AssistantConfiguration): string {
    const data = config.config_data?.integracionFotos;
    if (!data) return JSON.stringify({ areasComunes: [], fotosGenerales: [] }, null, 2);

    return JSON.stringify({
      areasComunes: data.areasComunes || [],
      fotosGenerales: data.fotosGenerales || [],
    }, null, 2);
  }

  /**
   * Genera todos los archivos temporalmente y retorna un mapa nombre -> ruta del archivo temporal
   * Los archivos se crean en el directorio temporal del sistema
   */
  async generateAllFiles(
    config: AssistantConfiguration,
    businessId: string
  ): Promise<Map<string, string>> {
    const files = new Map<string, string>();
    const tempDir = os.tmpdir();
    const businessIdClean = businessId.replace(/[^a-zA-Z0-9-]/g, '-');

    // Generar contenido
    const precioDisponibilidadContent = this.generatePrecioDisponibilidad(config);
    const informacionEstablecimientoContent = this.generateInformacionEstablecimiento(config);
    const informacionExtraContent = this.generateInformacionExtra(config);
    const integracionFotosContent = this.generateIntegracionFotos(config);

    // Crear archivos temporales con nombres que incluyen business ID
    const fileDefinitions = [
      { name: `precio-disponibilidad-${businessIdClean}.md`, content: precioDisponibilidadContent },
      { name: `informacion-establecimiento-${businessIdClean}.md`, content: informacionEstablecimientoContent },
      { name: `informacion-extra-${businessIdClean}.md`, content: informacionExtraContent },
      { name: `integracion-fotos-${businessIdClean}.json`, content: integracionFotosContent },
    ];

    for (const fileDef of fileDefinitions) {
      // Solo crear archivo si tiene contenido
      if (fileDef.content && fileDef.content.trim().length > 0) {
        const filePath = path.join(tempDir, fileDef.name);
        fs.writeFileSync(filePath, fileDef.content, 'utf-8');
        files.set(fileDef.name, filePath);
      }
    }

    return files;
  }

  /**
   * Elimina archivos temporales del sistema
   */
  async cleanupTempFiles(filePaths: string[]): Promise<void> {
    for (const filePath of filePaths) {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        // Log pero no fallar si no se puede eliminar
        console.warn(`No se pudo eliminar archivo temporal ${filePath}:`, error);
      }
    }
  }
}

