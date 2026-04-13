import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentPages } from './document_pages.entity';
import { DocumentPagesService } from './document_pages.service';
import { DocumentPagesController } from './document_pages.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentPages])],
  providers: [DocumentPagesService],
  controllers: [DocumentPagesController],
  exports: [DocumentPagesService]
})
export class DocumentPagesModule {}