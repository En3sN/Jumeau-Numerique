import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, HttpCode, HttpStatus, BadRequestException, Logger, Query, ParseIntPipe } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './DTO/create-reservation.dto';
import { UpdateReservationDto } from './DTO/update-reservation.dto';
import { JwtAuthGuard } from 'src/security/jwt-auth.guard/jwt-auth.guard';
import { GetServiceCreneauxDto } from './DTO/get-service-creneaux.dto';
import { ValidationPipe } from '@nestjs/common';
import { LockReservationCreneauDto } from './DTO/LockReservationCreneau.dto';

@Controller('reservation')
export class ReservationController {
  private readonly logger = new Logger(ReservationController.name);

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
  @Get('can-reserve')
  async canReserveService(
    @Query('serviceId', ParseIntPipe) serviceId: number,
    @Query('userId', ParseIntPipe) userId: number,
    @Request() req
  ): Promise<boolean> {
    const sessionCode = req.user.sessionCode;
    return this.reservationService.canReserveService(serviceId, userId, sessionCode);
  }

  @UseGuards(JwtAuthGuard)
  @Post('lock-creneau')
  @HttpCode(HttpStatus.OK)
  async lockCreneauReservation(
    @Body(new ValidationPipe({ transform: true })) lockCreneauDto: LockReservationCreneauDto,
    @Request() req
  ) {
    const { serviceId, startTime, endTime, userId, action } = lockCreneauDto;
    const message = await this.reservationService.lockCreneauReservation(serviceId, startTime, endTime, userId, action, req.user.sessionCode);
    return { message };
  }

  @UseGuards(JwtAuthGuard)
  @Get('service/:serviceId')
  async findAllReservationsByService(@Param('serviceId') serviceId: string) {
    const parsedServiceId = parseInt(serviceId, 10);
    if (isNaN(parsedServiceId)) {
      this.logger.error(`Invalid serviceId: ${serviceId}`);
      throw new BadRequestException('Paramètre serviceId invalide');
    }
    return await this.reservationService.findAllReservationsByService(parsedServiceId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async getServiceCreneaux(
    @Query(new ValidationPipe({ transform: true })) query: GetServiceCreneauxDto,
    @Request() req
  ) {
    const sessionCode = req.user.sessionCode;
    const { serviceId, semaine, year, duree } = query;
  
    console.log('Requête reçue avec les paramètres:', { serviceId, semaine, year, duree, sessionCode });
  
    return this.reservationService.getServiceCreneaux(serviceId, semaine, year, duree, sessionCode);
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
