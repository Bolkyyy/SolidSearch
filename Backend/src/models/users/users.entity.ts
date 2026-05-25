import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'users', schema: 'solidsearchdb'})
export class Users {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: true })
    full_name!: string;

    @Column({ unique: true, nullable: true })
    email!: string;

    @Column({ nullable: true })
    password_hash!: string;

    @Column({ nullable: true })
    role_id!: number;

    @Column({ nullable: true })
    status!: string;

    @CreateDateColumn( { type: "timestamp", name: "created_at" } )
    created_at!: Date;
}