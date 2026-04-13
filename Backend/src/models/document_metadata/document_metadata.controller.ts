import { Controller, Get } from '@nestjs/common';
import { DocumentMetadataService } from './document_metadata.service';

@Controller('document-metadata')
export class DocumentMetadataController {
    constructor(private readonly documentMetadataService: DocumentMetadataService) {}

    @Get()
    async findall() {
        return await this.documentMetadataService.findall();
    }
}