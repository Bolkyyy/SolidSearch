import { Controller, Get } from '@nestjs/common';
import { DocumentSourcesService } from './document_sources.service';

@Controller('document_sources')
export class DocumentSourcesController {
    constructor(private readonly documentSourcesService: DocumentSourcesService){}

    @Get()
    async findall() {
        return await this.documentSourcesService.findall();
    }
}
