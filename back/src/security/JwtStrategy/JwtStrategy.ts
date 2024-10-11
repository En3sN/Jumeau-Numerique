import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UtilisateurService } from '../utilisateur/utilisateur.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private utilisateurService: UtilisateurService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    console.log("Payload:", payload);

    // Récupérer l'utilisateur en fonction du code de session
    const user = await this.utilisateurService.getUserBySessionCode(payload.sessionCode);
    if (!user) {
      throw new UnauthorizedException();
    }

    // Vérifier que l'email et l'ID de l'utilisateur correspondent à ceux du payload
    if (user.email !== payload.email || user.id !== payload.id) {
      throw new UnauthorizedException();
    }

    return { ...payload, user };
  }
}
