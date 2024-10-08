import { IsInt, IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class LockCreneauDto {
  @IsInt()
  @IsNotEmpty()
  activiteId: number;

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