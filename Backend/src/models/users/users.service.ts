import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,
    ) {}

    async findall(): Promise<Users[]> {
        return await this.usersRepository.find();
    }

    async loginOrCreate(email: any, password: any): Promise<Users | undefined> {
        let user = await this.usersRepository.findOne({ where: { email } });

        if (!user) {
            throw new UnauthorizedException('Неверный email');
        }

        if (user.password_hash !== password) {
            throw new UnauthorizedException('Неверный пароль');
        }
        
        return user;
    }
}
