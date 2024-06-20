import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsArray, IsBoolean, IsInt } from 'class-validator';

export class UpdateUtilisateurDto {
  @IsString()
  @IsOptional()
  nom?: string;

  @IsString()
  @IsOptional()
  pseudo?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  tel?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  pwd?: string;

  @IsString()
  @IsOptional()
  adresse?: string;

  @IsString()
  @IsOptional()
  cp?: string;

  @IsString()
  @IsOptional()
  commune?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  roles?: string[];

  @IsBoolean()
  @IsOptional()
  activated?: boolean;

  @IsString()
  @IsOptional()
  statut?: string;

  @IsInt()
  @IsOptional()
  organisation?: number;

  @IsString()
  @IsOptional()
  organisation_nom?: string;
}
