import { Body, Controller, Get, Post, UseGuards, Request, HttpCode, HttpStatus, Put, Param, Logger, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '../security/jwt-auth.guard/jwt-auth.guard';
import { UtilisateurService } from './utilisateur.service';
import { CreateUtilisateurDto } from './DTO/create-utilisateur.dto';
import { UpdateUtilisateurDto } from './DTO/update-utilisateur-infos.dto';

@Controller('utilisateur')
export class UtilisateurController {
  private readonly logger = new Logger(UtilisateurController.name);

  constructor(private utilisateurService: UtilisateurService) { }

  @UseGuards(JwtAuthGuard)
  @Get('infos')
  async getUserInfo(@Request() req): Promise<any> {
    const sessionCode = req.user.sessionCode;
    if (!sessionCode) {
      throw new Error('Session code is missing from the JWT payload.');
    }
    const userInfo = await this.utilisateurService.findAllUserInfo(sessionCode);
    return userInfo;
  }

  @UseGuards(JwtAuthGuard)
  @Get('roles')
  async getUserRoles(@Request() req): Promise<string[]> {
    const sessionCode = req.user.sessionCode;
    if (!sessionCode) {
      throw new Error('Session code is missing from the JWT payload.');
    }
    const roles = await this.utilisateurService.getUserRolesBySessionCode(sessionCode);
    console.log(roles);
    return roles;

  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUtilisateurDto: CreateUtilisateurDto): Promise<any> {
    return await this.utilisateurService.createUser(createUtilisateurDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  async updateUser(@Param('id') id: number, @Body() updateUtilisateurDto: UpdateUtilisateurDto, @Request() req): Promise<any> {
    const sessionCode = req.user.sessionCode;
    if (!sessionCode) {
      throw new Error('Session code is missing from the JWT payload.');
    }
    return await this.utilisateurService.updateUser(id, updateUtilisateurDto, sessionCode);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/:id/role')
  @HttpCode(HttpStatus.OK)
  async addRoleToUser(@Param('id') id: number, @Body('roles') roles: string, @Request() req): Promise<any> {
    const sessionCode = req.user.sessionCode;
    if (!sessionCode) {
      throw new Error('Session code is missing from the JWT payload.');
    }
    return await this.utilisateurService.addRoleToUser(id, roles, sessionCode);
  }
}
