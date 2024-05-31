import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extrait le JWT du header Authorization
      ignoreExpiration: false, // Ne pas ignorer l'expiration du token
      secretOrKey: 'SECRET_KEY', // Clé secrète pour vérifier la signature du token
    });
  }

  async validate(payload: any) {
    return { sessionCode: payload.sessionCode }; // Retourne le payload validé, accessible dans les reqêtes
  }
}
