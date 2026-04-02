import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './student.entity';
import { Roles } from './roles.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Roles)
    private rolesRepository: Repository<Roles>,
  ) {}

  async getAllStudents(): Promise<Student[]> {
    return await this.studentRepository.find();
  }

  async getFullData() {
    const students = await this.studentRepository.find();
    const groups = await this.rolesRepository.find();

  return {
      allStudents: students,
      allGroups: groups,
    };
  }
}
