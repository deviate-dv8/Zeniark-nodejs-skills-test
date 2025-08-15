import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '../authentication/passport-strategies/jwt/jwt.auth.guard';
import createValidationPipe from 'src/utils/createValidationPipe';
import updateValidationPipe from 'src/utils/updateValidationPipe';
import { Roles } from 'src/guards/roles-guard/roles.decorator';
import { RolesGuard } from 'src/guards/roles-guard/roles.guard';
import type { RequestJwt } from 'src/utils/RequestJwt';
import { PaginationDto } from './dto/pagination.dto';

@Controller('api/notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body(createValidationPipe)
    createNoteDto: CreateNoteDto,
    @Req() req: RequestJwt,
  ) {
    return this.notesService.create(createNoteDto, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAllByUser(@Req() req: RequestJwt, @Query() paginationDto: PaginationDto) {
    return this.notesService.findAllByUser(req.user, paginationDto);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN'])
  findALl() {
    return this.notesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Req() req: RequestJwt) {
    return this.notesService.findOne(id, req.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body(updateValidationPipe) updateNoteDto: UpdateNoteDto,
    @Req() req: RequestJwt,
  ) {
    return this.notesService.update(id, updateNoteDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req: RequestJwt) {
    return this.notesService.remove(id, req.user);
  }
}
