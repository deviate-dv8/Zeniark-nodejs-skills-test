import { PartialType } from '@nestjs/swagger';
import { CreateNoteDto } from './create-note.dto';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateNoteDto extends PartialType(CreateNoteDto) {
  @IsString()
  @IsOptional()
  title: string | undefined;
  @IsOptional()
  @IsString()
  content: string | undefined;

  @IsString()
  @IsOptional()
  categoryId: string | undefined;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tagIds: string[] | undefined;
}
