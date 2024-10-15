import { Body, Controller, Get, Post, UseGuards, Request, HttpCode, HttpStatus, Put, Param, Logger, Patch, Delete, Query, UseInterceptors, UploadedFile, Res, NotFoundException, UploadedFiles } from '@nestjs/common';
import { ActiviteService } from './activite.service';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/security/jwt-auth.guard/jwt-auth.guard';
import { CreateActiviteDto } from './DTO/create-activite.dto';
import { UpdateActiviteDto } from './DTO/update-activite.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Controller('activite')
export class ActiviteController {
  private readonly logger = new Logger(ActiviteController.name);

  constructor(private activiteService: ActiviteService) { }

  @Get()
  async findAllPublic(@Query() queryParams: any): Promise<any[]> {
    return await this.activiteService.findAllPublic(queryParams);
  }

  @UseGuards(JwtAuthGuard)
  @Get('subscribed')
  async findAllSubscribed(@Request() req): Promise<any[]> {
    const userId = req.user.id;
    return this.activiteService.findAllSubscribed(userId);
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
  @Get(':id/all-services')
  async getServicesByActiviteId(@Param('id') id: number, @Request() req): Promise<any> {
    const sessionCode = req.user.sessionCode;
    return this.activiteService.findAllServicesByActiviteId(id, sessionCode);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/service')
  async getServiceById(@Param('id') id: number, @Request() req): Promise<any> {
    const sessionCode = req.user.sessionCode;
    return this.activiteService.findServiceById(id, sessionCode);
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

  @UseGuards(JwtAuthGuard)
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('documents'), FileInterceptor('logo'))
  async create(
    @Body() createActiviteDto: CreateActiviteDto,
    @UploadedFiles() documents: Express.Multer.File[],
    @UploadedFile() logo: Express.Multer.File,
    @Request() req: any
  ): Promise<any> {
    if (logo) {
      createActiviteDto.logo = logo;
    }
    if (documents && documents.length > 0) {
      createActiviteDto.documents = documents;
    }
    createActiviteDto.Id = req.user.id;
    return await this.activiteService.create(createActiviteDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  @HttpCode(HttpStatus.CREATED)
  async subscribeToActivite(
    @Body() subscriptionData: { userId: number, activiteId: number, mail?: string },
    @Request() req
  ): Promise<any> {
    const sessionCode = req.user.sessionCode;
    if (!sessionCode) {
      throw new Error('Session code is missing from the JWT payload.');
    }
    return await this.activiteService.subscribeToActivite(subscriptionData, sessionCode);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logo/:id')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(@Param('id') id: number, @UploadedFile() file: Express.Multer.File) {
    return this.activiteService.uploadLogo(id, file.buffer);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: number, @Body() updateActiviteDto: UpdateActiviteDto, @Request() req): Promise<any> {
    const sessionCode = req.user.sessionCode;
    if (!sessionCode) {
      throw new Error('Session code is missing from the JWT payload.');
    }

    if (updateActiviteDto.rdv_duree < 30) {
      throw new Error('La durée du rendez-vous initial ne peut pas être inférieure à 30 minutes.');
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
  @Delete('logo/:id')
  async deleteLogo(@Param('id') id: number) {
    return this.activiteService.deleteLogo(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('unsubscribe/:activiteId')
  @HttpCode(HttpStatus.OK)
  async unsubscribeFromActivite(
    @Param('activiteId') activiteId: number,
    @Request() req
  ): Promise<any> {
    const userId = req.user.id;
    await this.activiteService.unsubscribeFromActivite(userId, activiteId);
    return { message: 'Désabonnement réussi et données supprimées.' };
  }
}