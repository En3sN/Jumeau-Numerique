import { IsBoolean, IsEmail, IsInt, IsOptional, IsString, IsArray } from 'class-validator';

export class UtilisateurInfoDto {
    @IsInt()
    id: number;

    @IsString()
    nom: string;

    @IsString()
    pseudo: string;

    @IsEmail()
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
    roles: string[];

    @IsBoolean()
    activated: boolean;

    @IsString()
    statut: string;

    @IsInt()
    @IsOptional()
    organisation?: number;
}
