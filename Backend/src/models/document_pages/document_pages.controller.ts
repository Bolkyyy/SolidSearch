import { Controller, Get } from '@nestjs/common';
import { DocumentPagesService } from './document_pages.service';

@Controller('document-pages')
export class DocumentPagesController {
    constructor(private readonly documentPagesService: DocumentPagesService) {}

    @Get()
    async findall() {
        return await this.documentPagesService.findall();
    }
}