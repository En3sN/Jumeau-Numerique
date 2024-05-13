import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

@Injectable()
export class LocalAuthGuard extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'pseudo',  
      passwordField: 'pwd'      
    });
  }

  async validate(pseudo: string, pwd: string): Promise<any> {
    console.log("Received in LocalAuthGuard - Pseudo:", pseudo, "Password:", pwd);
    const user = await this.authService.validateUser(pseudo, pwd);
    console.log("User found in LocalAuthGuard:", user);
    if (!user) {
      throw new UnauthorizedException('User not found or incorrect password.');
    }
    return user;
  }
}
