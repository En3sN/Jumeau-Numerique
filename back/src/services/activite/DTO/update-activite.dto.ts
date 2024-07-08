import { PartialType } from '@nestjs/mapped-types';
import { CreateActiviteDto } from './create-activite.dto';
import { IsString, IsOptional, IsBoolean, IsArray, IsNumber } from 'class-validator';

export class UpdateActiviteDto extends PartialType(CreateActiviteDto) {
  @IsString()
  @IsOptional()
  nom?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  domaine?: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsNumber()
  @IsOptional()
  organisation?: number;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  role?: string;

  @IsOptional()
  infos?: any;

  @IsBoolean()
  @IsOptional()
  rdv?: boolean;

  @IsString()
  @IsOptional()
  adresse?: string;

  @IsString()
  @IsOptional()
  cp?: string;

  @IsString()
  @IsOptional()
  commune?: string;

  @IsNumber()
  @IsOptional()
  contact?: number;

  @IsString()
  @IsOptional()
  mail_rdv?: string;

  @IsOptional()
  prerequis?: any;

  @IsOptional()
  user_infos?: any;

  @IsNumber()
  @IsOptional()
  rdv_duree?: number;

  @IsOptional()
  @IsBoolean()
  public: boolean;
}
