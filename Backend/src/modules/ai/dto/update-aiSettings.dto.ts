import { IsOptional, IsString, IsBoolean } from "class-validator";

export class UpdateAiSettingsDto {
    @IsOptional()
    @IsString()
    provider_code?: string;

    @IsOptional()
    @IsString()
    model_name?: string;

    @IsOptional()
    @IsString()
    api_key?: string;

    @IsOptional()
    @IsString()
    base_url?: string;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}