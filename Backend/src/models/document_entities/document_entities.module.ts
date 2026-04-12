import { Module } from '@nestjs/common';
import { DocumentEntitiesService } from './document_entities.service';
import { DocumentEntitiesController } from './document_entities.controller';

@Module({
  providers: [DocumentEntitiesService],
  controllers: [DocumentEntitiesController]
})
export class DocumentEntitiesModule {}
