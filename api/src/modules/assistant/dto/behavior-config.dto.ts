import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsEnum,
  IsEmail,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

// Enum para estado del asistente
export enum EstadoAsistente {
  ACTIVADO = 'activado',
  PAUSADO = 'pausado',
}

// Enum para horarios de funcionamiento
export enum HorariosFuncionamiento {
  MOSTRAR_HORARIOS = 'Mostrar horarios',
  VEINTICUATRO_SIETE = '24/7',
}

// Enum para reactivación de conversación
export enum ReactivacionConversacion {
  UN_DIA = '1',
  DOS_DIAS = '2',
  TRES_DIAS = '3',
  UNA_SEMANA = '7',
}

// Enum para zona horaria
export enum ZonaHoraria {
  URUGUAY = 'uruguay',
  ARGENTINA = 'argentina',
  BRASIL = 'brasil',
}

// Enum para valores de seguimiento
export enum ValorSeguimiento {
  NO_DEFINIDO = 'No definido',
  EN_24_HORAS = 'en-24-horas',
  EN_1_HORA = 'en-1-hora',
  EN_4_HORAS = 'en-4-horas',
  EN_6_HORAS = 'en-6-horas',
  EN_8_HORAS = 'en-8-horas',
  EN_12_HORAS = 'en-12-horas',
  EN_18_HORAS = 'en-18-horas',
  EN_30_MIN = 'en-30-min',
  NO_ENVIAR = 'no-enviar',
}

// DTO para seguimiento
export class SeguimientoDto {
  @IsString()
  tiempo: string;

  @IsBoolean()
  primero: boolean;

  @IsBoolean()
  segundo: boolean;

  @IsEnum(ValorSeguimiento)
  primerValor: ValorSeguimiento;

  @IsEnum(ValorSeguimiento)
  segundoValor: ValorSeguimiento;
}

// DTO principal para behavior_config
export class BehaviorConfigDto {
  @IsEnum(EstadoAsistente)
  estado: EstadoAsistente;

  @IsEnum(HorariosFuncionamiento)
  horarios: HorariosFuncionamiento;

  @IsEnum(ReactivacionConversacion)
  reactivar: ReactivacionConversacion;

  @IsEnum(ZonaHoraria)
  zonaHoraria: ZonaHoraria;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[\d\s\+\-\(\)]+$/, {
    message: 'El teléfono debe contener solo números, espacios y caracteres de formato',
  })
  telefono?: string;

  @IsString()
  @IsOptional()
  @Matches(/^-?\d+\.?\d*$/, {
    message: 'La latitud debe ser un número válido',
  })
  latitud?: string;

  @IsString()
  @IsOptional()
  @Matches(/^-?\d+\.?\d*$/, {
    message: 'La longitud debe ser un número válido',
  })
  longitud?: string;

  @IsString()
  @IsOptional()
  mensajePausa?: string;

  @IsBoolean()
  segundoMensaje: boolean;

  @IsString()
  @IsOptional()
  segundoMensajePausa?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SeguimientoDto)
  seguimientos: SeguimientoDto[];
}

