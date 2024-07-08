import { Body, Controller, Get, Post, UseGuards, Request, HttpCode, HttpStatus, Put, Param, Logger, Patch, Delete, Query, UseInterceptors, UploadedFile, Res, NotFoundException } from '@nestjs/common';
import { ActiviteService } from './activite.service';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/security/jwt-auth.guard/jwt-auth.guard';
import { CreateActiviteDto } from './DTO/create-activite.dto';
import { UpdateActiviteDto } from './DTO/update-activite.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('activite')
export class ActiviteController {
  private readonly logger = new Logger(ActiviteController.name);

  constructor(private activiteService: ActiviteService) { }

  @Get()
  async findAllPublic(@Query() queryParams: any): Promise<any[]> {
    return await this.activiteService.findAllPublic(queryParams);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: number, @Request() req): Promise<any> {
    const sessionCode = req.user.sessionCode;
    if (!sessionCode) {
      throw new Error('Session code is missing from the JWT payload.');
    }
    return await this.activiteService.findOne(id, sessionCode);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user/activities')
  async findUserActivities(@Request() req): Promise<any> {
    const sessionCode = req.user.sessionCode;
    if (!sessionCode) {
      throw new Error('Session code is missing from the JWT payload.');
    }
    return await this.activiteService.findUserActivities(sessionCode);
  }

  @UseGuards(JwtAuthGuard)
  @Post("create")
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createActiviteDto: CreateActiviteDto): Promise<any> {
    return await this.activiteService.create(createActiviteDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: number, @Body() updateActiviteDto: UpdateActiviteDto, @Request() req): Promise<any> {
    const sessionCode = req.user.sessionCode;
    if (!sessionCode) {
      throw new Error('Session code is missing from the JWT payload.');
    }
    return await this.activiteService.update(id, updateActiviteDto, sessionCode);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: number, @Request() req): Promise<any> {
    const sessionCode = req.user.sessionCode;
    if (!sessionCode) {
      throw new Error('Session code is missing from the JWT payload.');
    }
    await this.activiteService.remove(id, sessionCode);
    return { message: 'La suppression a été faite avec succès.' };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/all-services')
  async getServicesByActiviteId(@Param('id') id: number, @Request() req): Promise<any> {
    const sessionCode = req.user.sessionCode;
    return this.activiteService.findAllServicesByActiviteId(id, sessionCode);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/service')
  async getServiceByActivityId(@Param('id') id: number, @Request() req): Promise<any> {
    const sessionCode = req.user.sessionCode;
    return this.activiteService.findServicesByActiviteId(id, sessionCode);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logo/:id')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(@Param('id') id: number, @UploadedFile() file: Express.Multer.File) {
    return this.activiteService.uploadLogo(id, file.buffer);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('logo/:id')
  async deleteLogo(@Param('id') id: number) {
    return this.activiteService.deleteLogo(id);
  }

  @Get('logo/:id')
  async getLogo(@Param('id') id: number, @Res() res: Response) {
    const logo = await this.activiteService.getLogo(id);
    if (!logo) {
      throw new NotFoundException('Logo non trouvé');
    }
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(logo);
  }
}