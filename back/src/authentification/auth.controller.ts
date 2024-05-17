import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './LocalAuthGuard';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @UseGuards(LocalAuthGuard)
    @Post()
    async login(@Body() loginDto: LoginDto) { 
        const user = await this.authService.validateUser(loginDto.email, loginDto.pwd);
        if (!user) {
            return { message: 'Authentication failed. User not found or incorrect password.' };
        }
        return this.authService.login(user);
    }
}
