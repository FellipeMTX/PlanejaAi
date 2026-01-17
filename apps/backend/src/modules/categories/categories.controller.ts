import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Authenticated, CurrentUser, JwtPayload } from '../auth/auth.decorators';
import { CreateCategoryInput, UpdateCategoryInput } from '@repo/shared/request-dtos';

@Controller('categories')
@Authenticated()
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() data: CreateCategoryInput) {
    return this.categoriesService.create(user.userId, data);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.categoriesService.findAll(user.userId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.categoriesService.findOne(user.userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() data: UpdateCategoryInput
  ) {
    return this.categoriesService.update(user.userId, id, data);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.categoriesService.remove(user.userId, id);
  }
}
