import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { Authenticated, CurrentUser, JwtPayload } from '../auth/auth.decorators';
import { CreateAccountInput, UpdateAccountInput } from '@repo/shared/request-dtos';

@Controller()
@Authenticated()
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Post('wallets/:walletId/accounts')
  create(
    @CurrentUser() user: JwtPayload,
    @Param('walletId') walletId: string,
    @Body() data: CreateAccountInput
  ) {
    return this.accountsService.create(user.userId, walletId, data);
  }

  @Get('wallets/:walletId/accounts')
  findAllByWallet(
    @CurrentUser() user: JwtPayload,
    @Param('walletId') walletId: string
  ) {
    return this.accountsService.findAllByWallet(user.userId, walletId);
  }

  @Get('accounts/:id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.accountsService.findOne(user.userId, id);
  }

  @Patch('accounts/:id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() data: UpdateAccountInput
  ) {
    return this.accountsService.update(user.userId, id, data);
  }

  @Delete('accounts/:id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.accountsService.remove(user.userId, id);
  }
}
