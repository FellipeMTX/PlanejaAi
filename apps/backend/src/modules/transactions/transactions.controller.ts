import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Authenticated, CurrentUser, JwtPayload } from '../auth/auth.decorators';
import { CreateTransactionInput, UpdateTransactionInput } from '@repo/shared/request-dtos';

@Controller('transactions')
@Authenticated()
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() data: CreateTransactionInput) {
    return this.transactionsService.create(user.userId, data);
  }

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('accountId') accountId?: string,
    @Query('categoryId') categoryId?: string
  ) {
    return this.transactionsService.findAll(user.userId, { accountId, categoryId });
  }

  @Get('summary')
  getSummary(@CurrentUser() user: JwtPayload) {
    return this.transactionsService.getSummary(user.userId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.transactionsService.findOne(user.userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() data: UpdateTransactionInput
  ) {
    return this.transactionsService.update(user.userId, id, data);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.transactionsService.remove(user.userId, id);
  }
}
