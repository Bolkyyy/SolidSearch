import { IsOptional, IsString } from "class-validator";

export class UpdateAiSettingsDto {
    @IsOptional()
    @IsString()
    provider_code: string;

    @IsOptional()
    @IsString()
    model_name: string;

    @IsOptional()
    @IsString()
    api_key: string;
}