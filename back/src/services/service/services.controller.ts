import { Controller, Get, Post, Body, Param, Delete, Put, UploadedFile, UseInterceptors, Res, NotFoundException, UseGuards, HttpStatus, HttpCode, UploadedFiles, Patch, Request } from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
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
  @Post('subscribe')
  @HttpCode(HttpStatus.CREATED)
  async subscribeToService(
    @Body() subscriptionData: { userId: number, serviceId: number, validation: boolean },
    @Request() req
  ): Promise<any> {
    const sessionCode = req.user.sessionCode;
    if (!sessionCode) {
      throw new Error('Session code is missing from the JWT payload.');
    }
    return await this.servicesService.subscribeToService(subscriptionData, sessionCode);
  }
  
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto
  ) {
    const updatedService = await this.servicesService.update(+id, updateServiceDto);
    return updatedService;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('logo/:id')
  @UseInterceptors(FileInterceptor('logo'))
  async updateLogo(
    @Param('id') id: string,
    @UploadedFile() logo: Express.Multer.File
  ) {
    const updatedService = await this.servicesService.uploadLogo(+id, logo.buffer);
    return updatedService;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('documents/:id')
  @UseInterceptors(AnyFilesInterceptor())
  async updateDocuments(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    const updatedService = await this.servicesService.updateDocuments(+id, files);
    return updatedService;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.servicesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(+id);
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
