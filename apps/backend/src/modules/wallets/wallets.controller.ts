import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { Authenticated, CurrentUser, JwtPayload } from '../auth/auth.decorators';
import { CreateWalletInput, UpdateWalletInput } from '@repo/shared/request-dtos';

@Controller('wallets')
@Authenticated()
export class WalletsController {
  constructor(private walletsService: WalletsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() data: CreateWalletInput) {
    return this.walletsService.create(user.userId, data);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.walletsService.findAll(user.userId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.walletsService.findOne(user.userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() data: UpdateWalletInput
  ) {
    return this.walletsService.update(user.userId, id, data);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.walletsService.remove(user.userId, id);
  }
}
