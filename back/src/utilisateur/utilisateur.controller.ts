import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UtilisateurService } from './utilisateur.service';

@Controller('utilisateur')
export class UtilisateurController {
  constructor(private utilisateurService: UtilisateurService) {}

  @UseGuards(JwtAuthGuard) 
  @Get('Utilisateurinfos')
  async getUserInfo(@Request() req): Promise<any> {
    const sessionCode = req.user.sessionCode; 
    if (!sessionCode) {
      throw new Error('Session code is missing from the JWT payload.');
    }
    return await this.utilisateurService.findAllUserInfo(sessionCode);
  }
}
