import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import createValidationPipe from 'src/utils/createValidationPipe';
import updateValidationPipe from 'src/utils/updateValidationPipe';
import type { RequestJwt } from 'src/utils/RequestJwt';
import { JwtAuthGuard } from '../authentication/passport-strategies/jwt/jwt.auth.guard';
import { RolesGuard } from 'src/guards/roles-guard/roles.guard';
import { Roles } from 'src/guards/roles-guard/roles.decorator';

@Controller('api/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body(createValidationPipe) createCategoryDto: CreateCategoryDto,
    @Req() req: RequestJwt,
  ) {
    return this.categoriesService.create(createCategoryDto, req.user);
  }
  @Get('all')
  @UseGuards(JwtAuthGuard)
  @Roles(['ADMIN'])
  findallByUser(@Req() req: RequestJwt) {
    return this.categoriesService.findAllByUser(req.user);
  }
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll() {
    return this.categoriesService.findAll();
  }
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Req() req: RequestJwt) {
    return this.categoriesService.findOne(id, req.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body(updateValidationPipe) updateCategoryDto: UpdateCategoryDto,
    @Req() req: RequestJwt,
  ) {
    return this.categoriesService.update(id, updateCategoryDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id') id: string,

    @Req() req: RequestJwt,
  ) {
    return this.categoriesService.remove(id, req.user);
  }
}
