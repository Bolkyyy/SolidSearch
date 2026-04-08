import { Controller, Get } from '@nestjs/common';
import { DocumentFilesService } from './documents.service';

@Controller('documents')
export class DocumentsController {
    constructor(private readonly documentsService: DocumentFilesService) {}

    @Get()
    async findall() {
        return await this.documentsService.findall();
    }
}
