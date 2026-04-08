import { Controller, Get } from '@nestjs/common';
import { DocumentCollectionService } from './document_collection.service';


@Controller('document_collection')
export class DocumentCollectionController {
    constructor(private readonly documentCollectionService: DocumentCollectionService) {}

    @Get()
    async findall() {
        return await this.documentCollectionService.findall();
    }
}
