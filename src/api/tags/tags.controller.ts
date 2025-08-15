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
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import createValidationPipe from 'src/utils/createValidationPipe';
import updateValidationPipe from 'src/utils/updateValidationPipe';
import { JwtAuthGuard } from '../authentication/passport-strategies/jwt/jwt.auth.guard';
import type { RequestJwt } from 'src/utils/RequestJwt';
import { RolesGuard } from 'src/guards/roles-guard/roles.guard';
import { Roles } from 'src/guards/roles-guard/roles.decorator';

@Controller('api/tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body(createValidationPipe) createTagDto: CreateTagDto,
    @Req() req: RequestJwt,
  ) {
    return this.tagsService.create(createTagDto, req.user);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN'])
  findAll() {
    return this.tagsService.findAll();
  }
  @Get()
  @UseGuards(JwtAuthGuard)
  findAllByUser(@Req() req: RequestJwt) {
    return this.tagsService.findAllByUser(req.user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Req() req: RequestJwt) {
    return this.tagsService.findOne(id, req.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body(updateValidationPipe) updateTagDto: UpdateTagDto,
    @Req() req: RequestJwt,
  ) {
    return this.tagsService.update(id, updateTagDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req: RequestJwt) {
    return this.tagsService.remove(id, req.user);
  }
}
