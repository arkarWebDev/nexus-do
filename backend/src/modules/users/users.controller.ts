import {
  Controller,
  Get,
  Post,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import type { User } from '../../common/database/schema';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Res({ passthrough: true }) res: Response) {
    const user = await this.usersService.register();

    res.cookie('nexusdo_session', user.apiKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
      maxAge: 90 * 24 * 60 * 60 * 1000,
    });

    return user;
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Req() req: Request) {
    const user = req['user'] as User;
    return this.usersService.findById(user.id);
  }
}
