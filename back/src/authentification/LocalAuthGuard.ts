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
    console.log("LocalAuthGuard validate called with email:", email);
    const user = await this.authService.validateUser(email, pwd);
    if (!user) {
      console.log("No user found in LocalAuthGuard for email:", email);
      throw new UnauthorizedException();
    }
    console.log("User authenticated in LocalAuthGuard:", user);
    return user;
  }
}
