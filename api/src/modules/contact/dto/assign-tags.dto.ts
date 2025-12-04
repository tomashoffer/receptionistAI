import { IsArray, IsUUID } from 'class-validator';

export class AssignTagsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  tag_ids: string[];

  @IsUUID()
  assigned_by?: string;
}

