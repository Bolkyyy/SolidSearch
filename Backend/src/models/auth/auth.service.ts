import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Users } from '../users/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
  @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async findall(): Promise<Users[]> {
    return await this.usersRepository.find();
  }

  async login(email: string, password: string): Promise<Users | undefined> {
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
