import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsArray, IsBoolean, IsInt } from 'class-validator';

export class CreateUtilisateurDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsString()
  @IsNotEmpty()
  pseudo: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  tel?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  pwd: string;

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
  activated: boolean;

  @IsString()
  @IsNotEmpty()
  statut: string;

  @IsInt()
  @IsOptional()
  organisation?: number;

  @IsString()
  @IsOptional()
  organisation_nom?: string;
  
  @IsString()
  @IsOptional()
  salt?: string;
}
