import { IsEmail, IsString, Length } from "class-validator";

export class CreateUserDto {
    @IsString()
    @Length(2, 100)
    full_name: string;

    @IsEmail()
    @Length(2, 100)
    email: string;

    @IsString()
    @Length(2, 100)
    password: string;

    @IsString()
    @Length(2, 100)
    status: string;

    @IsString()
    @Length(2, 100)
    role: string;
}
