import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import type { Response, Request } from 'express';
import { CsrfToken, Msg } from './types/auth.type';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: AuthDto): Promise<Msg> {
    return this.authService.signup(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Msg> {
    const jwtToken = await this.authService.login(dto);
    res.cookie('access_token', jwtToken.accessToken, {
      httpOnly: true,
      secure: false, // 本番環境では true にする
      sameSite: 'none',
      path: '/',
      maxAge: 5 * 60 * 1000, // 5分
    });
    return { message: 'ログインに成功しました' };
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response): Promise<Msg> {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: false, // 本番環境では true にする
      sameSite: 'none',
      path: '/',
    });
    return { message: 'ログアウトに成功しました' };
  }
}
