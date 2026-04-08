import { Controller, Get } from '@nestjs/common';
import { DocumentFilesService } from './document_files.service';


@Controller('document_files')
export class DocumentFilesController {
    constructor(private readonly documentsService: DocumentFilesService) {}

    @Get()
    async findall() {
        return await this.documentsService.findall();
    }
}
