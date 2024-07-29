import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class GetRdvCreneauxDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  activiteId: number;

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
