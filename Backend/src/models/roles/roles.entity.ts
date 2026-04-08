import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'roles', schema: 'solidsearchdb' }) 
export class Roles {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  code!: string; // На скрине была именно эта колонка
}