import { Controller, Get, Post, Body, Param, Delete, Put, UploadedFile, UseInterceptors, Res, NotFoundException, UseGuards, HttpStatus, HttpCode, UploadedFiles } from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './DTO/create-service.dto';
import { UpdateServiceDto } from './DTO/update-service.dto';
import { JwtAuthGuard } from 'src/security/jwt-auth.guard/jwt-auth.guard';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(AnyFilesInterceptor()) 
  async create(
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[]
  ): Promise<any> {
    const createServiceDto = new CreateServiceDto();
    createServiceDto.activite_id = parseInt(body.activite_id, 10);
    createServiceDto.nom = body.nom;
    createServiceDto.description = body.description;
    createServiceDto.reference = body.reference;
    createServiceDto.type = body.type;
    createServiceDto.tags = body.tags ? body.tags.split(',') : [];
    createServiceDto.validation = body.validation === 'true';
    createServiceDto.template = body.template;
    createServiceDto.is_pack = body.is_pack === 'true';

    let logo: Express.Multer.File;
    let documents: Express.Multer.File[] = [];

    files.forEach(file => {
      if (file.fieldname === 'logo') {
        logo = file;
      } else if (file.fieldname === 'documents') {
        documents.push(file);
      }
    });

    if (logo) {
      createServiceDto.logo = logo;
    }
    if (documents.length > 0) {
      createServiceDto.documents = documents;
    }

    return await this.servicesService.create(createServiceDto);
  }


  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(+id, updateServiceDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logo/:id')
  @UseInterceptors(FileInterceptor('file'))
  uploadLogo(@Param('id') id: number, @UploadedFile() file: Express.Multer.File) {
    return this.servicesService.uploadLogo(id, file.buffer);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('logo/:id')
  deleteLogo(@Param('id') id: number) {
    return this.servicesService.deleteLogo(id);
  }
}
