import { IsString, IsNotEmpty, IsOptional, IsArray, IsNumber, IsBoolean } from 'class-validator';

export class CreateActiviteDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  logo: string;

  @IsString()
  @IsOptional()
  reference: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  domaine: string;

  @IsArray()
  @IsOptional()
  documents: string[];

  @IsString()
  @IsOptional()
  url: string;

  @IsNumber()
  @IsNotEmpty()
  organisation: number;

  @IsArray()
  @IsOptional()
  tags: string[];

  @IsString()
  @IsOptional()
  role: string;

  @IsOptional()
  infos: any;

  @IsBoolean()
  @IsOptional()
  rdv: boolean;

  @IsString()
  @IsOptional()
  adresse: string;

  @IsString()
  @IsOptional()
  cp: string;

  @IsString()
  @IsOptional()
  commune: string;

  @IsNumber()
  @IsOptional()
  contact: number;

  @IsString()
  @IsOptional()
  mail_rdv: string;

  @IsOptional()
  prerequis: any;

  @IsOptional()
  user_infos: any;

  @IsNumber()
  @IsOptional()
  rdv_duree: number;
}
