import { Controller, Post, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.pwd);
    if (!user) {
      return { message: 'Authentication failed. User not found or incorrect password.' };
    }
    const jwt = await this.authService.login(user);
    response.cookie('token', jwt.access_token, { httpOnly: true, secure: false, sameSite: 'lax' });
    return { message: 'Login successful' };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.cookie('token', '', { httpOnly: true, expires: new Date(0) });
    return { message: 'Logout successful' };
  }
}
