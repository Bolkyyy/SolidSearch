import { IsNumber, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class UploadDocumentDto {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    user_id?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    collection_id?: number;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    author_name?: string;

    @IsOptional()
    @IsString()
    archive_number?: string;

    @IsOptional()
    @IsString()
    language?: string;
}