import { Controller, Get, Post, Body, Param, Delete, Put, UploadedFile, UseInterceptors, Res, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './DTO/create-service.dto';
import { UpdateServiceDto } from './DTO/update-service.dto';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  @Get()
  findAll() {
    return this.servicesService.findAll();
  }

  @Get('logo/:id')
  async getLogo(@Param('id') id: number, @Res() res: Response) {
    const logo = await this.servicesService.getLogo(id);
    if (!logo) {
      throw new NotFoundException('Logo not found');
    }
    res.setHeader('Content-Type', 'image/jpeg'); 
    res.send(logo);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(+id, updateServiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(+id);
  }

  @Post('logo/:id')
  @UseInterceptors(FileInterceptor('file'))
  uploadLogo(@Param('id') id: number, @UploadedFile() file: Express.Multer.File) {
    return this.servicesService.uploadLogo(id, file.buffer);
  }

  @Delete('logo/:id')
  deleteLogo(@Param('id') id: number) {
    return this.servicesService.deleteLogo(id);
  }
}
