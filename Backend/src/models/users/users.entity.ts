
import { Column, CreateDateColumn, Entity,  JoinColumn,  ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Roles } from "../roles/roles.entity";

@Entity({ name: 'users', schema: 'solidsearchdb' })
export class Users {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  full_name!: string;

  @Column({ unique: true, nullable: true })
  email!: string;

  @Column({ nullable: true })
  password_hash!: string;

  @ManyToOne(() => Roles, (role) => role.users)
  @JoinColumn({ name: 'role_id' }) // указываем, какой столбец БД отвечает за связь
  role!: Roles; // свойство-сущность

  @Column({ nullable: true })
  status!: string;

  @CreateDateColumn({ type: "timestamp", name: "created_at" })
  created_at!: Date;
}