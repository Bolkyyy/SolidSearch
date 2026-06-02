import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateHistoryDto {
    @IsOptional()
    @IsNumber()
    user_id?: number;

    @IsString()
    query_text: string;

    @IsOptional()
    @IsString()
    query_type?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    result_count?: number;

    @IsOptional()
    filters_json?: any;
}