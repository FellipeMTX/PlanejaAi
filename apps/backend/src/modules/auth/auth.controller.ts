import { Controller, Post, Get, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, Authenticated, CurrentUser, JwtPayload } from './auth.decorators';
import { SignupInput, LoginInput } from '@repo/shared/request-dtos';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup')
  async signup(@Body() data: SignupInput) {
    return this.authService.signup(data);
  }

  @Public()
  @Post('login')
  async login(@Body() data: LoginInput) {
    return this.authService.login(data);
  }

  @Authenticated()
  @Get('me')
  async getMe(@CurrentUser() user: JwtPayload) {
    return this.authService.getMe(user.userId);
  }
}
