import {
  ExecutionContext,        
  Injectable,             
  UnauthorizedException,   
} from '@nestjs/common';   

import { AuthGuard } from '@nestjs/passport'; 
import { JwtService } from '@nestjs/jwt';     
import { Request } from 'express';          

@Injectable()
//assure que seules les requêtes avec un token JWT valide peuvent accéder aux routes protégées, en vérifiant le token et en ajoutant les données de l'utilisateur à l'objet request pour une utilisation ultérieure
export class JwtAuthGuard extends AuthGuard('jwt') { 
  constructor(private jwtService: JwtService) { 
    super(); 
  }

  // Fonction qui détermine si la requête peut passer le garde d'authentification
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Récupère la requête HTTP du contexte d'exécution
    const request = context.switchToHttp().getRequest<Request>();
    
    // Extrait le token JWT des cookies de la requête
    const token = this.extractTokenFromCookie(request);
    
    // Si aucun token n'est trouvé, lance une exception UnauthorizedException
    if (!token) {
      throw new UnauthorizedException();
    }
    
    try {
      // Vérifie et décode le token JWT
      const payload = await this.jwtService.verifyAsync(token);
      
      // Ajoute le payload décodé (données de l'utilisateur) à l'objet request
      request['user'] = payload;
    } catch {
      // Si la vérification échoue, lance une exception UnauthorizedException
      throw new UnauthorizedException();
    }
    
    // Si tout est correct, retourne true pour permettre l'accès
    return true;
  }

  // Méthode privée pour extraire le token JWT des cookies de la requête
  private extractTokenFromCookie(request: Request): string | undefined {
    // Retourne le token JWT stocké dans le cookie 'jwt', sinon undefined
    return request.cookies['jwt'];
  }
}
