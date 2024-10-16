import { IsNotEmpty, IsNumber, IsObject } from 'class-validator';

export class AddPrerequisDto {
  @IsNumber()
  @IsNotEmpty()
  activite_id: number;

  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsObject()
  @IsNotEmpty()
  prerequis: { [key: string]: string };
}