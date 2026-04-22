import {IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

export class loginRequestDto{
    @IsNotEmpty()
    @IsEmail()
    email!: string;
    
    @IsNotEmpty()
    @IsString()
    @Length(7, 128)
    password!: string;
}