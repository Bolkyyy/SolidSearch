import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'audit_logs', schema: 'solidsearchdb'})
export class AuditLogs {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    user_id!: number;

    @Column()
    document_id!: number;

    @Column()
    action_type!: string;

    @Column()
    payload!: string;

    @Column({ type: 'timestamp', name: 'created_at' })
    created_at!: Date;
}