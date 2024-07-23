import { Type } from 'class-transformer';
import { IsInt, IsString, IsDate, IsNotEmpty } from 'class-validator';

export class CreateCreneauServiceDto {
  @IsInt()
  @IsNotEmpty()
  service_id: number;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  date_debut: Date;
  
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  date_fin: Date;

  @IsString()
  @IsNotEmpty()
  type_creneau: string;
}