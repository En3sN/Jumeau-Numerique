import { IsInt, IsObject } from "class-validator";

export class AddPrerequisDto {
    @IsInt()
    activite_id: number;

    @IsInt()
    user_id: number;

    @IsObject()
    prerequis: Record<string, any>;  
}
