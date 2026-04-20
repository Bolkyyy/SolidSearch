import { Module } from '@nestjs/common';
import { DocumentMetadataController } from './document_metadata.controller';

@Module({
  controllers: [DocumentMetadataController]
})
export class DocumentMetadataModule {}
