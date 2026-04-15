import { Controller, Get } from '@nestjs/common';
import { DocumentEntitiesService } from './document_entities.service';

@Controller('document-entities')
export class DocumentEntitiesController {
    constructor (private readonly documentEntitiesService: DocumentEntitiesService) {}

    @Get()
    async findall() {
        return this.documentEntitiesService.findall();
    }
}
