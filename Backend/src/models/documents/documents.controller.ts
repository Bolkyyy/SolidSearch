import { Controller, Get } from '@nestjs/common';
import { DocumentFilesService } from './documents.service';

@Controller('documents')
export class DocumentsController {
    constructor(private readonly documentsService: DocumentFilesService) {}

    @Get(':id')
    async findAll() {
        return await this.documentsService.findall();
    }
}
