import { IsOptional, IsString } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  title: string;
  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  categoryId: string;
}
