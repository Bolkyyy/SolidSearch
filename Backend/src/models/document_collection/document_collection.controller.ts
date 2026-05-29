import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { DocumentCollectionService } from './document_collection.service';

export class CreateCollectionDto {
  name: string;
  description: string;
  code: string;
  is_active: boolean;
  source_id: number;
}

@Controller('document_collection')
export class DocumentCollectionController {
    constructor(private readonly documentCollectionService: DocumentCollectionService) {}

    @Get()
    async findall() {
        return await this.documentCollectionService.findall();
    }

    @Post()
    async create(@Body() dto: CreateCollectionDto) {
        return await this.documentCollectionService.create(dto);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return await this.documentCollectionService.remove(id);
    }
}