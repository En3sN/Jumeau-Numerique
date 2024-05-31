import { Controller, Post, Get, Body, Res, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './DTO/login.dto';
import { Response, Request } from 'express';
import { JwtAuthGuard } from '../security/jwt-auth.guard/jwt-auth.guard';

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
    response.cookie('jwt', jwt.access_token, { httpOnly: true, secure: true, sameSite: 'lax' });
    return { message: 'Login successful',jwt };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
    response.cookie('_csrf', '', { httpOnly: true, expires: new Date(0) }); 
    return { message: 'Logout successful' };
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  async status(@Req() req: Request) {
    return { loggedIn: true, user: req['user'] };
  }
}
