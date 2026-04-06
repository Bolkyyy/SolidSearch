import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentCollection } from './document_collection.entity';
import { DocumentCollectionService } from './document_collection.service';
import { DocumentCollectionController } from './document_collection.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentCollection])],
  providers: [DocumentCollectionService],
  controllers: [DocumentCollectionController],
  exports: [DocumentCollectionService]
})
export class DocumentCollectionModule {}
