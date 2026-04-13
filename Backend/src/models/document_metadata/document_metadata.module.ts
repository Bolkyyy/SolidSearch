import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentMetadata } from './document_metadata.entity';
import { DocumentMetadataService } from './document_metadata.service';
import { DocumentMetadataController } from './document_metadata.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentMetadata])],
  providers: [DocumentMetadataService],
  controllers: [DocumentMetadataController],
  exports: [DocumentMetadataService]
})
export class DocumentMetadataModule {}