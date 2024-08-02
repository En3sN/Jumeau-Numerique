import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, HttpCode, HttpStatus, BadRequestException, Logger, Query } from '@nestjs/common';
import { CreneauAdminService } from './creneau-admin.service';
import { CreateCreneauAdminDto } from './DTO/create-creneau-admin.dto';
import { UpdateCreneauAdminDto } from './DTO/update-creneau-admin.dto';
import { JwtAuthGuard } from 'src/security/jwt-auth.guard/jwt-auth.guard';
import { error } from 'console';

@Controller('creneau-admin')
export class CreneauAdminController {

  constructor(private readonly creneauAdminService: CreneauAdminService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCreneauAdminDto: CreateCreneauAdminDto, @Request() req) {
    const userId = req.user.id;  
    return this.creneauAdminService.create(createCreneauAdminDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('all-creneaux')
  async getCreneauxAdmin(@Query('activiteId') activiteId: string, @Request() req) {
    const userId = req.user.id; 
    const parsedActiviteId = parseInt(activiteId, 10);
    if (isNaN(parsedActiviteId)) {
      throw new BadRequestException('Paramètre activiteId invalide');
    }
    return this.creneauAdminService.getCreneauxAdmin(parsedActiviteId, userId);
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
    const userId = req.user.id;  
    return this.creneauAdminService.update(parsedId, updateCreneauAdminDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Paramètre id invalide');
    }
    const userId = req.user.id; 
    return this.creneauAdminService.remove(parsedId, userId);
  }
}
