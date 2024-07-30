import { Controller, Get, Param, Query } from '@nestjs/common';
import { TypesService } from './types.service';

@Controller('types')
export class TypesController {
  constructor(private readonly typesService: TypesService) {}
  
  @Get()
  findAll(): Promise<string[]> {
    return this.typesService.findAll();
  }

  @Get('json-creneaux')
  async getJsonRdvCreneaux(
    @Query('activiteId') activiteId: number,
    @Query('semaine') semaine: number,
    @Query('year') year: number,
    @Query('duree') duree: number
  ) {
    return this.typesService.getJsonRdvCreneaux(activiteId, semaine, year, duree);
  }

  @Get('plages')
  async getRdvPlages(
    @Query('activiteId') activiteId: number,
    @Query('semaine') semaine: number,
    @Query('year') year: number,
    @Query('duree') duree: number
  ) {
    return this.typesService.getRdvPlages(activiteId, semaine, year, duree);
  }

  @Get('intervals')
  async getIntervals(@Query('listDate') listDate: string[]) {
    return this.typesService.getIntervals(listDate);
  }

  @Get('interval-exception')
  async getIntervalWithException(
    @Query('dDeb') dDeb: string,
    @Query('dFin') dFin: string,
    @Query('activiteId') activiteId: number
  ) {
    return this.typesService.getIntervalWithException(dDeb, dFin, activiteId);
  }

  @Get('interval-without-rdv')
  async getIntervalWithoutRdv(
    @Query('dDeb') dDeb: string,
    @Query('dFin') dFin: string,
    @Query('activiteId') activiteId: number
  ) {
    return this.typesService.getIntervalWithoutRdv(dDeb, dFin, activiteId);
  }

  @Get('recurrent-week')
  async getRecurentFroWeek(
    @Query('dDeb') dDeb: string,
    @Query('dFin') dFin: string,
    @Query('week') week: number,
    @Query('year') year: number
  ) {
    return this.typesService.getRecurentFroWeek(dDeb, dFin, week, year);
  }
}
