import { Controller, Get } from '@nestjs/common';
import { Documents } from './documents.entity'
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) {}

    @Get()
    async findall() {
        return await this.documentsService.findall();
    }
}
