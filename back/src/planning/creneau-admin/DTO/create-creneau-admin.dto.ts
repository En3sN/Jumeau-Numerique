import { IsNotEmpty, IsString, IsInt, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCreneauAdminDto {
  @IsInt()
  @IsNotEmpty()
  user_id: number;

  @IsInt()
  @IsNotEmpty()
  activite_id: number;

  @IsString()
  @IsNotEmpty()
  type_creneau: string;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  date_debut: Date;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  date_fin: Date;
}
