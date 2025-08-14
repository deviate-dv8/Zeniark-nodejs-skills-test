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
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '../authentication/passport-strategies/jwt/jwt.auth.guard';
import { JwtResponse } from '../authentication/passport-strategies/jwt/jwt.strategy';
import createValidationPipe from 'src/utils/createValidationPipe';
import updateValidationPipe from 'src/utils/updateValidationPipe';
import { Roles } from 'src/guards/roles-guard/roles.decorator';
import { RolesGuard } from 'src/guards/roles-guard/roles.guard';

@Controller('api/notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body(createValidationPipe)
    createNoteDto: CreateNoteDto,
    @Req() req: { user: JwtResponse },
  ) {
    return this.notesService.create(createNoteDto, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAllByUser(@Req() req: { user: JwtResponse }) {
    return this.notesService.findAllByUser(req.user);
  }
  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN'])
  findALl() {
    return this.notesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Req() req: { user: JwtResponse }) {
    return this.notesService.findOne(id, req.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body(updateValidationPipe) updateNoteDto: UpdateNoteDto,
    @Req() req: { user: JwtResponse },
  ) {
    return this.notesService.update(id, updateNoteDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: { user: JwtResponse }) {
    return this.notesService.remove(id, req.user);
  }
}
