import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './student.entity';
import { Roles } from './roles.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433, // Порт который пропишете вы(возможно у вас будет не 5433 а другой если вы поменяете)
      username: 'admin', //Пользователь который в yaml файле
      password: 'secret_pass', //Пароль из yaml фалйа
      database: 'app_db', //Имя бд опять же из yaml файла 
      entities: [Student, Roles], 
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Student, Roles]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}