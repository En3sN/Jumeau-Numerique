import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class GetServiceCreneauxDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  serviceId: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  semaine?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  year?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  duree?: number;
}
