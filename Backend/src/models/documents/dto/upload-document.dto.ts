import { IsNumber, IsOptional, IsString } from "class-validator";

export class UploadDocumentDto {
    @IsOptional()
    @IsNumber()
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