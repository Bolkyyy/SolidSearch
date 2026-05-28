import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create_user.dto';
import { UpdateUserDto } from './dto/update_user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) { }

    @Get()
    async getAnswer() {
        return this.userService.getUsers();
    }

    @Post()
    async createUser(@Body() userData: CreateUserDto) {
        return this.userService.createUser(userData);
    }

    @Delete('/:id')
    async deleteUser(@Param('id') userId: number) {
        return this.userService.deleteUser(userId);
    }

    @Put('/:id')
    async updateUser(@Param('id') userId: number, @Body() userData: UpdateUserDto) {
        return this.userService.updateUser(userId, userData);
    }
}
