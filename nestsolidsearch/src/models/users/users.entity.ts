import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'users', schema: 'solidsearchdb'})
export class Users {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    full_name!: string;

    @Column()
    email!: string;

    @Column()
    password_hash!: string;

    @Column()
    role_id!: number;

    @Column()
    status!: string;

    @CreateDateColumn({type: "timestamp", name: "created_at"})
    created_at!: Date;
}