import { IsString, IsNotEmpty, IsOptional, IsArray, IsInt, IsBoolean } from 'class-validator';

export class CreateServiceDto {
  @IsNotEmpty()
  @IsInt()
  activite_id: number;

  @IsNotEmpty()
  @IsString()
  nom: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  validation?: boolean;

  @IsOptional()
  @IsString()
  template?: string;

  @IsOptional()
  @IsBoolean()
  is_pack?: boolean;

  @IsOptional()
  logo?: Express.Multer.File;

  @IsOptional()
  @IsArray()
  documents?: Express.Multer.File[];
}
