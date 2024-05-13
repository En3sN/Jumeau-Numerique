import { Body, Controller, Get, Post, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UtilisateurService } from './utilisateur.service';
import { CreateUtilisateurDto } from './DTO/Create-utilisateur.dto';

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

  @UseGuards(JwtAuthGuard)
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Request() req, @Body() createUtilisateurDto: CreateUtilisateurDto) {
    const sessionCode = req.user.sessionCode;  
    if (!sessionCode) {
      throw new Error('Session code is missing from the JWT payload.');
    }
    return await this.utilisateurService.createUser(createUtilisateurDto, sessionCode);
  }
}
