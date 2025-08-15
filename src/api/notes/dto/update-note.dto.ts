import { PartialType } from '@nestjs/swagger';
import { CreateNoteDto } from './create-note.dto';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateNoteDto extends PartialType(CreateNoteDto) {
  @IsString()
  @IsOptional()
  title: string;
  @IsOptional()
  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  categoryId: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tagIds: string[];
}
