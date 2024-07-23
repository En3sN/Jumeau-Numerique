import { IsOptional, IsString, IsInt, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCreneauAdminDto {
  @IsInt()
  @IsOptional()
  user_id?: number;

  @IsInt()
  @IsOptional()
  activite_id?: number;

  @IsString()
  @IsOptional()
  type_creneau?: string;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  date_debut?: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  date_fin?: Date;
}
