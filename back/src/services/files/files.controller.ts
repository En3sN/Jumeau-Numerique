import { Controller, Post, UseInterceptors, UploadedFile, Get, Param, Res, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Param('activiteId') activiteId: number) {
    return this.filesService.uploadFile(file, activiteId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async downloadFile(@Param('id') id: number, @Res() res: Response) {
    const { document, decryptedData } = await this.filesService.downloadFile(id);

    res.set({
      'Content-Type': document.mimetype,
      'Content-Disposition': `attachment; filename="${document.titre}"`,
    });
    res.send(decryptedData);
  }
}
