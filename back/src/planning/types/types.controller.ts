import { Controller, Get, Param } from '@nestjs/common';
import { TypesService } from './types.service';
import { TypeCreneau } from './entities/type-creneau.entity';

@Controller('types')
export class TypesController {
  constructor(private readonly typesService: TypesService) {}
  
  @Get()
  findAll(): Promise<string[]> {
    return this.typesService.findAll();
  }
}
