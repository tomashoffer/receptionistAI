import { IsUUID } from 'class-validator';

export class ImportContactsDto {
  @IsUUID()
  business_id: string;
}

export interface ContactImportRow {
  nombre: string;
  telefono: string;
  email?: string;
  fuente?: string;
  notas?: string;
  etiquetas?: string;
}

export interface ImportResult {
  total: number;
  created: number;
  updated: number;
  errors: Array<{
    row: number;
    data: ContactImportRow;
    error: string;
  }>;
}

