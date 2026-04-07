import { Injectable } from '@nestjs/common';
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

    async loginOrCreate(email: any, password: any): Promise<Users> {
        let user = await this.usersRepository.findOne({ where: { email } });

        if (!user) {
            user = this.usersRepository.create({
            email: email,
            full_name: 'New User',
            password_hash: password,
            role_id: 1,
            status: 'active',
        });
            
        try {
            await this.usersRepository.save(user);
        } catch (err: any) {
            console.error("ОШИБКА ТУТ:", err.message); 
            throw err;
            }
        }

        return user;
    }
}
