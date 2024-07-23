import { IsInt, IsNotEmpty, IsEnum, IsDateString } from 'class-validator';

export class CreateRdvDto {
  @IsInt()
  @IsNotEmpty()
  user_id: number;

  @IsInt()
  @IsNotEmpty()
  activite_id: number;

  @IsDateString()
  @IsNotEmpty()
  date_rdv: Date;

  @IsEnum(['rdv_initial', 'rdv_simple'])
  @IsNotEmpty()
  type_rdv: string;

  @IsEnum(['Demande', 'Accepte', 'Refuse'])
  @IsNotEmpty()
  status: string;
}
