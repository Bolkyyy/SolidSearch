import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './users.entity';
import { Roles } from '../roles/roles.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Users, Roles])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],

})
export class UsersModule {}
