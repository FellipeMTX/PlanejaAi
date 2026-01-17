import { Injectable, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../shared/services/prisma.service';
import { SimpleErr, FromZodErr } from '@/errors';
import { SignupSchema, LoginSchema, SignupInput, LoginInput } from '@repo/shared/request-dtos';
import { JwtPayload } from './auth.decorators';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async signup(data: SignupInput) {
    const parsed = SignupSchema.safeParse(data);
    if (!parsed.success) {
      throw new FromZodErr(parsed.error);
    }

    const { name, email, password } = parsed.data;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new SimpleErr('Este e-mail já está em uso', HttpStatus.CONFLICT);
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const payload: JwtPayload = { userId: user.id };
    const token = await this.jwtService.signAsync(payload);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  }

  async login(data: LoginInput) {
    const parsed = LoginSchema.safeParse(data);
    if (!parsed.success) {
      throw new FromZodErr(parsed.error);
    }

    const { email, password } = parsed.data;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new SimpleErr('E-mail ou senha incorretos', HttpStatus.UNAUTHORIZED);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new SimpleErr('E-mail ou senha incorretos', HttpStatus.UNAUTHORIZED);
    }

    const payload: JwtPayload = { userId: user.id };
    const token = await this.jwtService.signAsync(payload);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new SimpleErr('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }

    return user;
  }
}
