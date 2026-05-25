import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Users } from '../users/users.entity';


@Entity({ name: 'roles', schema: 'solidsearchdb' })
export class Roles {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  code!: string;

  @OneToMany(() => Users, (user) => user.role) // user.role — свойство, а не user.role_id
  users!: Users[];
}