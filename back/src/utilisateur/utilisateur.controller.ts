import { Body, Controller, Get, Post, UseGuards, Request, HttpCode, HttpStatus, Put, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../authentification/jwt-auth.guard';
import { UtilisateurService } from './utilisateur.service';
import { CreateUtilisateurDto } from './DTO/Create-utilisateur.dto';
import { UpdateUtilisateurDto } from './DTO/update-utilisateur-infos.dto';

@Controller('utilisateur')
export class UtilisateurController {
  constructor(private utilisateurService: UtilisateurService) {}

  @UseGuards(JwtAuthGuard)
  @Get('infos')
  async getUserInfo(@Request() req): Promise<any> {
    const sessionCode = req.user.sessionCode;
    if (!sessionCode) {
      throw new Error('Session code is missing from the JWT payload.');
    }
    return await this.utilisateurService.findAllUserInfo(sessionCode);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUtilisateurDto: CreateUtilisateurDto): Promise<any> {
    return await this.utilisateurService.createUser(createUtilisateurDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  async updateUser(@Param('id') id: number, @Body() updateUtilisateurDto: UpdateUtilisateurDto, @Request() req): Promise<any> {
    const sessionCode = req.user.sessionCode;
    if (!sessionCode) {
      throw new Error('Session code is missing from the JWT payload.');
    }
    return await this.utilisateurService.updateUser(id, updateUtilisateurDto, sessionCode);
  }
}
