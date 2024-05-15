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
    console.log("LocalAuthGuard validate called with pseudo:", pseudo);
    const user = await this.authService.validateUser(pseudo, pwd);
    if (!user) {
      console.log("No user found in LocalAuthGuard for pseudo:", pseudo);
      throw new UnauthorizedException();
    }
    console.log("User authenticated in LocalAuthGuard:", user);
    return user;
  }
}
