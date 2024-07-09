import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { OrganisationService } from './organisation.service';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { JwtAuthGuard } from '../jwt-auth.guard/jwt-auth.guard';

@Controller('organisation')
export class OrganisationController {
  constructor(private readonly organisationService: OrganisationService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('logo'))
  async create(
    @Body() createOrganisationDto: CreateOrganisationDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (file) {
      createOrganisationDto.logo = file.buffer;
    }
    return this.organisationService.create(createOrganisationDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.organisationService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.organisationService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('logo'))
  async update(
    @Param('id') id: string,
    @Body() updateOrganisationDto: UpdateOrganisationDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (file) {
      updateOrganisationDto.logo = file.buffer;
    }
    return this.organisationService.update(+id, updateOrganisationDto);
  }
  
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.organisationService.remove(+id);
  }
}
