import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Request } from '@nestjs/common';
import { OrganisationService } from './organisation.service';
import { CreateOrganisationDto } from './DTO/create-organisation.dto';
import { UpdateOrganisationDto } from './DTO/update-organisation.dto';
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
    @UploadedFile() file: Express.Multer.File,
    @Request() req
  ) {
    const userId = req.user.id;
    if (file) {
      createOrganisationDto.logo = file.buffer;
    }
    return this.organisationService.create(createOrganisationDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('myOrganisation')
  async findByUser(@Request() req) {
    const userId = req.user.id;
    return this.organisationService.findByUserId(userId);
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
