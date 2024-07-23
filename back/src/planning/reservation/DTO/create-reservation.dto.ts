import { IsInt, IsNotEmpty, IsEnum, IsDateString } from 'class-validator';

export class CreateReservationDto {
  @IsInt()
  @IsNotEmpty()
  user_id: number;

  @IsInt()
  @IsNotEmpty()
  service_id: number;

  @IsDateString()
  @IsNotEmpty()
  date_resa: Date;

  @IsEnum(['Demande', 'Confirmé', 'Annulé'])
  @IsNotEmpty()
  status: string;
}
