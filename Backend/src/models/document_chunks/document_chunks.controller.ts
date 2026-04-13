import { Controller, Get } from '@nestjs/common';
import { DocumentChunksService } from './document_chunks.service';

@Controller('document-chunks')
export class DocumentChunksController {
    constructor (private readonly documentChunksService: DocumentChunksService) {}

    @Get()
    async findall() {
        return await this.documentChunksService.findall();
    }
}
