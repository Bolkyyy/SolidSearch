import { Module } from '@nestjs/common';
import { DocumentMetadataService } from './document_metadata.service';
import { DocumentMetadataController } from './document_metadata.controller';

@Module({
  providers: [DocumentMetadataService],
  controllers: [DocumentMetadataController]
})
export class DocumentMetadataModule {}
