import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('roles') 
export class Roles {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  role!: string;
}