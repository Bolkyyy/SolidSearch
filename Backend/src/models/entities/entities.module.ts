import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entities } from './entities.entity';
import { EntitiesService } from './entities.service';
import { EntitiesModuleController } from './entities.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Entities])],
  providers: [EntitiesService],
  controllers: [EntitiesModuleController],
  exports: [EntitiesService]
})
export class EntitiesModule {}