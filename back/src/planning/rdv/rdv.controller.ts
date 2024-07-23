import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, HttpCode, HttpStatus, BadRequestException, Logger } from '@nestjs/common';
import { RdvService } from './rdv.service';
import { CreateRdvDto } from './dto/create-rdv.dto';
import { UpdateRdvDto } from './dto/update-rdv.dto';
import { JwtAuthGuard } from 'src/security/jwt-auth.guard/jwt-auth.guard';

@Controller('rdv')
export class RdvController {
  private readonly logger = new Logger(RdvController.name);

  constructor(private readonly rdvService: RdvService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRdvDto: CreateRdvDto, @Request() req) {
    const sessionCode = req.user.sessionCode;
    return await this.rdvService.create(createRdvDto, sessionCode);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return await this.rdvService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      this.logger.error(`Invalid id: ${id}`);
      throw new BadRequestException('Paramètre id invalide');
    }
    return await this.rdvService.findOne(parsedId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updateRdvDto: UpdateRdvDto, @Request() req) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      this.logger.error(`Invalid id: ${id}`);
      throw new BadRequestException('Paramètre id invalide');
    }
    const sessionCode = req.user.sessionCode;
    return await this.rdvService.update(parsedId, updateRdvDto, sessionCode);
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
    return await this.rdvService.remove(parsedId, sessionCode);
  }
}
