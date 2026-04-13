import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Embeddings } from './embeddings.entity';
import { EmbeddingsService } from './embeddings.service';
import { EmbeddingsController } from './embeddings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Embeddings])],
  providers: [EmbeddingsService],
  controllers: [EmbeddingsController],
  exports: [EmbeddingsService]
})
export class EmbeddingsModule {}