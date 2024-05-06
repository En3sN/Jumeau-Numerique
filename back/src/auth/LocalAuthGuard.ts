import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

@Injectable()
export class LocalAuthGuard extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'pwd'
    });
  }

  async validate(email: string, pwd: string): Promise<any> {
    console.log("Received in LocalAuthGuard - Email:", email, "Password:", pwd);
    const user = await this.authService.validateUser(email, pwd);
    console.log("User found in LocalAuthGuard:", user);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  } 
}

