import { IsBoolean, IsEmail, IsInt, IsOptional, IsString, IsArray, IsNotEmpty, IsDefined } from 'class-validator';

export class GetUtilisateurInfoDto {
  @IsInt()
  id: number;

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
  @IsDefined()
  activated: boolean;

  @IsString()
  @IsNotEmpty()
  statut: string;

  @IsInt()
  @IsOptional()
  organisation?: number;
}
