import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import {loginRequestDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post()
  login(@Body() dto:loginRequestDto){
    return this.authService.login(dto.email, dto.password);
  }
}