import { Controller, Get, Param } from '@nestjs/common';
import { DocumentFilesService } from './documents.service';

@Controller('documents')
export class DocumentsController {
    constructor(private readonly documentsService: DocumentFilesService) {}

    @Get()
    async findAll() {
        return await this.documentsService.findall();
    }

    @Get(':id')
    async findbyid(@Param('id') id: string) {
        return await this.documentsService.findbyid(Number(id));
    }

}