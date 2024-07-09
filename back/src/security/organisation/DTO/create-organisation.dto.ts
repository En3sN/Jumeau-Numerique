import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class CreateOrganisationDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsString()
  @IsNotEmpty()
  activite: string;

  @IsString()
  @IsOptional()
  tel?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  web?: string;

  @IsString()
  @IsOptional()
  siret?: string;

  @IsString()
  @IsOptional()
  adresse?: string;

  @IsString()
  @IsOptional()
  cp?: string;

  @IsString()
  @IsOptional()
  commune?: string;

  @IsString()
  @IsOptional()
  descriptif?: string;

  @IsString()
  @IsOptional()
  commentaire?: string;

  @IsOptional()
  logo?: Buffer;

  @IsString()
  @IsOptional()
  template?: string;
}
