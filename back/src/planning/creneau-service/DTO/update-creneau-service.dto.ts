import { Type } from 'class-transformer';
import { IsInt, IsString, IsDate, IsOptional } from 'class-validator';

export class UpdateCreneauServiceDto {
  @IsInt()
  @IsOptional()
  service_id?: number;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  date_debut?: Date;
  
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  date_fin?: Date;

  @IsString()
  @IsOptional()
  type_creneau?: string;
}
