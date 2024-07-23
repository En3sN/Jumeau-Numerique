import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, HttpCode, HttpStatus, BadRequestException, Logger } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { JwtAuthGuard } from 'src/security/jwt-auth.guard/jwt-auth.guard';

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
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      this.logger.error(`Invalid id: ${id}`);
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
      this.logger.error(`Invalid id: ${id}`);
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
      this.logger.error(`Invalid id: ${id}`);
      throw new BadRequestException('Paramètre id invalide');
    }
    const sessionCode = req.user.sessionCode;
    return await this.reservationService.remove(parsedId, sessionCode);
  }
}
