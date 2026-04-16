import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService){}

    @Get()
    async findall() {
        return await this.usersService.findall();
    }

    @Post('login')
    async login(@Body() body: { email: string, password: string }) {
        return await this.usersService.login(body.email, body.password)
    }
}

    