import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, HttpCode, HttpStatus, BadRequestException, Logger, Query } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { JwtAuthGuard } from 'src/security/jwt-auth.guard/jwt-auth.guard';

@Controller('reservation')
export class ReservationController {

  constructor(private readonly reservationService: ReservationService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createReservationDto: CreateReservationDto, @Request() req) {
    const sessionCode = req.user.sessionCode;
    return await this.reservationService.create(createReservationDto, sessionCode);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return await this.reservationService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('all-creneaux')
  async getServiceCreneaux(
    @Query('serviceId') serviceId: string,
    @Query('semaine') semaine: string,
    @Query('year') year: string,
    @Query('duree') duree: string,
    @Request() req
  ) {
    const sessionCode = req.user.sessionCode;
    const parsedServiceId = parseInt(serviceId, 10);
    const parsedSemaine = semaine ? parseInt(semaine, 10) : undefined;
    const parsedYear = year ? parseInt(year, 10) : undefined;
    const parsedDuree = duree ? parseInt(duree, 10) : undefined;

    if (isNaN(parsedServiceId) || (semaine && isNaN(parsedSemaine)) || (year && isNaN(parsedYear)) || (duree && isNaN(parsedDuree))) {
      throw new BadRequestException('Invalid parameters');
    }

    return this.reservationService.getServiceCreneaux(parsedServiceId, parsedSemaine, parsedYear, parsedDuree, sessionCode);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Paramètre id invalide');
    }
    return await this.reservationService.findOne(parsedId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updateReservationDto: UpdateReservationDto, @Request() req) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Paramètre id invalide');
    }
    const sessionCode = req.user.sessionCode;
    return await this.reservationService.update(parsedId, updateReservationDto, sessionCode);
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
    return await this.reservationService.remove(parsedId, sessionCode);
  }
}
