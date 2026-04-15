import { Module } from '@nestjs/common';
import { DocumentEntitiesService } from './document_entities.service';
import { DocumentEntitiesController } from './document_entities.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentEntities } from './document_entities.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntities])],
  providers: [DocumentEntitiesService],
  controllers: [DocumentEntitiesController],
  exports: [DocumentEntitiesService]
})
export class DocumentEntitiesModule {}
