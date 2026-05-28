import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './users.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create_user.dto';
import { Roles } from '../roles/roles.entity';
import { UpdateUserDto } from './dto/update_user.dto';
import { hash } from 'argon2';
@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(Users) private readonly usersRepository: Repository<Users>,
        @InjectRepository(Roles) private readonly roleRepository: Repository<Roles>,
    ) { }

    async getUsers(): Promise<Users[]> {
        const users = await this.usersRepository.find({ select: ['id', 'email', 'full_name', 'status'], relations: ['role'] });
        return users
    }

    async deleteUser(userId: number) {
        await this.usersRepository.delete(userId);
        return
    }

    async createUser(userData: CreateUserDto): Promise<Users> {
        const role = await this.roleRepository.findOne({ where: { code: userData.role } });
        if (!role) {
            throw new NotFoundException(`Role with code ${userData.role} not found`);
        }
        const { password, ...rest } = userData;
        const newUser = this.usersRepository.create({ ...rest, role, password_hash: await hash(password) });
        const savedUser = await this.usersRepository.save(newUser);
        return savedUser;
    }

    async updateUser(userId: number, userData: UpdateUserDto): Promise<Users> {
        const role = await this.roleRepository.findOne({ where: { code: userData.role } });
        if (!role) {
            throw new NotFoundException(`Role with code ${userData.role} not found`);
        }

        const { password, ...rest } = userData;
        await this.usersRepository.update(userId, { ...rest, role, password_hash: await hash(password) });
        return;
    }
}