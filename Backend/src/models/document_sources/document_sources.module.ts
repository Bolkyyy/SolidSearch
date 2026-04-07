import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm"
import { DocumentSourcesService } from './document_sources.service';
import { DocumentSourcesController } from './document_sources.controller';
import { DocumentSources } from './document_sources.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentSources])],
  providers: [DocumentSourcesService],
  controllers: [DocumentSourcesController],
  exports: [DocumentSourcesService]
})
export class DocumentSourcesModule {}
