import { IsInt, IsString, IsNotEmpty, IsIn, IsDateString } from 'class-validator';

export class LockReservationCreneauDto {
  @IsInt()
  @IsNotEmpty()
  serviceId: number;

  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  action: string;
}