import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, HttpCode, HttpStatus, BadRequestException, Logger, Query } from '@nestjs/common';
import { CreneauAdminService } from './creneau-admin.service';
import { CreateCreneauAdminDto } from './dto/create-creneau-admin.dto';
import { UpdateCreneauAdminDto } from './dto/update-creneau-admin.dto';
import { JwtAuthGuard } from 'src/security/jwt-auth.guard/jwt-auth.guard';

@Controller('creneau-admin')
export class CreneauAdminController {

  constructor(private readonly creneauAdminService: CreneauAdminService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCreneauAdminDto: CreateCreneauAdminDto, @Request() req) {
    const sessionCode = req.user.sessionCode;
    return this.creneauAdminService.create(createCreneauAdminDto, sessionCode);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.creneauAdminService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Paramètre id invalide');
    }
    return this.creneauAdminService.findOne(parsedId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updateCreneauAdminDto: UpdateCreneauAdminDto, @Request() req) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Paramètre id invalide');
    }
    const sessionCode = req.user.sessionCode;
    return this.creneauAdminService.update(parsedId, updateCreneauAdminDto, sessionCode);
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
    return this.creneauAdminService.remove(parsedId, sessionCode);
  }
}
