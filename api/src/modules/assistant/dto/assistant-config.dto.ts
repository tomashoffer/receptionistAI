import {
  IsString,
  IsOptional,
  IsObject,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Industry } from '../../business/entities/business.entity';
import { ValidateByIndustry } from '../decorators/validate-by-industry.decorator';

// DTOs para estructuras anidadas
export class SituacionDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsBoolean()
  revisado: boolean;
}

export class ConfigFieldDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  value: string;

  @IsBoolean()
  locked: boolean;
}

export class ConfiguracionAsistenteDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfigFieldDto)
  fields: ConfigFieldDto[];

  @IsObject()
  directrices: {
    value: string;
    locked: boolean;
  };

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SituacionDto)
  situaciones: SituacionDto[];
}

export class PrecioDisponibilidadDto {
  @IsArray()
  secciones: Array<{
    key: string;
    title: string;
    questions: Array<{
      pregunta: string;
      respuesta: string;
      revisado: boolean;
    }>;
  }>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SituacionDto)
  situaciones: SituacionDto[];

  @IsObject()
  configAvanzada: {
    detenerseCotizacion: boolean;
    totalMinimo: string;
    instruccionesCalculo: string;
    mensajeFijo: string;
  };
}

export class IntegracionFotosDto {
  @IsArray()
  areasComunes: Array<{
    id: number;
    tipo: string;
    nombre: string;
    descripcion: string;
    imagenes: string[];
  }>;

  @IsArray()
  @IsString({ each: true })
  fotosGenerales: string[];
}

// DTO principal para crear
export class CreateAssistantConfigDto {
  @IsString()
  @IsNotEmpty()
  business_id: string;

  @IsEnum(Industry)
  @IsNotEmpty()
  industry: Industry;

  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsObject()
  @ValidateByIndustry()
  config_data: {
    configuracionAsistente: ConfiguracionAsistenteDto;
    precioDisponibilidad: PrecioDisponibilidadDto;
    informacionEstablecimiento: Record<string, any>;
    informacionExtra: Record<string, any>;
    integracionFotos: IntegracionFotosDto;
  };
}

// DTO para actualizar
export class UpdateAssistantConfigDto {
  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsObject()
  @ValidateByIndustry()
  config_data?: {
    configuracionAsistente?: Partial<ConfiguracionAsistenteDto>;
    precioDisponibilidad?: Partial<PrecioDisponibilidadDto>;
    informacionEstablecimiento?: Record<string, any>;
    informacionExtra?: Record<string, any>;
    integracionFotos?: Partial<IntegracionFotosDto>;
  };
}

