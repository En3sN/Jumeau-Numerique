import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request, HttpCode, HttpStatus, BadRequestException, Logger } from '@nestjs/common';
import { CreneauServiceService } from './creneau-service.service';
import { CreateCreneauServiceDto } from './DTO/create-creneau-service.dto';
import { UpdateCreneauServiceDto } from './DTO/update-creneau-service.dto';
import { JwtAuthGuard } from 'src/security/jwt-auth.guard/jwt-auth.guard';

@Controller('creneau-service')
export class CreneauServiceController {

  constructor(private readonly creneauServiceService: CreneauServiceService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCreneauServiceDto: CreateCreneauServiceDto, @Request() req) {
    const sessionCode = req.user.sessionCode;
    return await this.creneauServiceService.create(createCreneauServiceDto, sessionCode);
  }

@UseGuards(JwtAuthGuard)
@Get('recurrent')
async getServiceRecurrentCreneaux(
  @Query('serviceId') serviceId: string,
  @Query('semaine') semaine: string,
  @Query('year') year: string
) {
  const parsedServiceId = parseInt(serviceId, 10);
  const parsedSemaine = parseInt(semaine, 10);
  const parsedYear = parseInt(year, 10);

  if (isNaN(parsedServiceId) || isNaN(parsedSemaine) || isNaN(parsedYear)) {
    throw new BadRequestException('Paramètres invalides');
  }

  return await this.creneauServiceService.getServiceRecurrentCreneaux(parsedServiceId, parsedSemaine, parsedYear);
}



  @UseGuards(JwtAuthGuard)
  @Get('all-creneaux')
  async getCreneauxService(@Query('serviceId') serviceId: string) {
    const parsedServiceId = parseInt(serviceId, 10);
    if (isNaN(parsedServiceId)) {
      throw new BadRequestException('Paramètre serviceId invalide');
    }
    return await this.creneauServiceService.getCreneauxService(parsedServiceId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Paramètre id invalide');
    }
    return await this.creneauServiceService.findOne(parsedId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updateCreneauServiceDto: UpdateCreneauServiceDto, @Request() req) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Paramètre id invalide');
    }
    const sessionCode = req.user.sessionCode;
    return await this.creneauServiceService.update(parsedId, updateCreneauServiceDto, sessionCode);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Paramètre id invalide');
    }
    const sessionCode = req.user.sessionCode;
    return await this.creneauServiceService.remove(parsedId, sessionCode);
  }
}
