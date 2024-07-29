import { Controller, Post, UseInterceptors, UploadedFiles, Get, Param, Res, UseGuards, Delete } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from 'src/security/jwt-auth.guard/jwt-auth.guard';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Post('upload/:activiteId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadFilesForActivite(@UploadedFiles() files: Express.Multer.File[], @Param('activiteId') activiteId: number) {
    return this.filesService.uploadFiles(files, activiteId);
  }

  @Post('upload-service/:serviceId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadFilesForService(@UploadedFiles() files: Express.Multer.File[], @Param('serviceId') serviceId: number) {
    return this.filesService.uploadFiles(files, undefined, serviceId);
  }

  @Get('document/:id')
  async downloadFile(@Param('id') id: number, @Res() res: Response) {
    const { document, decryptedData } = await this.filesService.downloadFile(id);

    res.set({
      'Content-Type': document.mimetype,
      'Content-Disposition': `attachment; filename="${document.titre}"`,
    });
    res.send(decryptedData);
  }

  @Get('documents/:activiteId')
  async getDocumentsByActiviteId(@Param('activiteId') activiteId: number) {
    return this.filesService.getDocumentsByActiviteId(activiteId);
  }

  @Get('service-documents/:serviceId')
  @UseGuards(JwtAuthGuard)
  async getDocumentsByServiceId(@Param('serviceId') serviceId: number) {
    return this.filesService.getDocumentsByServiceId(serviceId);
  }

  @Get('allDownload/:activiteId')
  async downloadFilesByActiviteId(@Param('activiteId') activiteId: number, @Res() res: Response) {
    return this.filesService.downloadFilesByActiviteId(activiteId, res);
  }

  @Get('service-allDownload/:serviceId')
  @UseGuards(JwtAuthGuard)
  async downloadFilesByServiceId(@Param('serviceId') serviceId: number, @Res() res: Response) {
    return this.filesService.downloadFilesByServiceId(serviceId, res);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteFile(@Param('id') id: number) {
    return this.filesService.deleteFile(id);
  }
}
