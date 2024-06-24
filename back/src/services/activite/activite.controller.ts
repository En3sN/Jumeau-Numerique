import { Body, Controller, Get, Post, UseGuards, Request, HttpCode, HttpStatus, Put, Param, Logger, Patch, Delete } from '@nestjs/common';
import { ActiviteService } from './activite.service';
import { JwtAuthGuard } from 'src/security/jwt-auth.guard/jwt-auth.guard';
import { CreateActiviteDto } from './DTO/create-activite.dto';
import { UpdateActiviteDto } from './DTO/update-activite.dto';

@Controller('activite')
export class ActiviteController {
  private readonly logger = new Logger(ActiviteController.name);

  constructor(private activiteService: ActiviteService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req): Promise<any> {
    const sessionCode = req.user.sessionCode;
    if (!sessionCode) {
      throw new Error('Session code is missing from the JWT payload.');
    }
    return await this.activiteService.findAll(sessionCode);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: number, @Request() req): Promise<any> {
    const sessionCode = req.user.sessionCode;
    if (!sessionCode) {
      throw new Error('Session code is missing from the JWT payload.');
    }
    return await this.activiteService.findOne(id, sessionCode);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user/activities')
  async findUserActivities(@Request() req): Promise<any> {
    const sessionCode = req.user.sessionCode;
    if (!sessionCode) {
      throw new Error('Session code is missing from the JWT payload.');
    }
    return await this.activiteService.findUserActivities(sessionCode);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createActiviteDto: CreateActiviteDto): Promise<any> {
    return await this.activiteService.create(createActiviteDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: number, @Body() updateActiviteDto: UpdateActiviteDto, @Request() req): Promise<any> {
    const sessionCode = req.user.sessionCode;
    if (!sessionCode) {
      throw new Error('Session code is missing from the JWT payload.');
    }
    return await this.activiteService.update(id, updateActiviteDto, sessionCode);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: number, @Request() req): Promise<any> {
    const sessionCode = req.user.sessionCode;
    if (!sessionCode) {
      throw new Error('Session code is missing from the JWT payload.');
    }
    await this.activiteService.remove(id, sessionCode);
    return { message: 'La suppression a été faite avec succès.' };
  }
}