import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: "index_jobs", schema: "solidsearchdb"})
export class IndexJobs {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: true })
    document_id!: number;

    @Column({ nullable: true })
    status!: string;

    @Column({ nullable: true })
    parser_type!: string;

    @Column({ type: 'timestamp' })
    started_at!: Date

    @Column({ type: 'timestamp', nullable: true })
    finished_at!: Date

    @Column({ nullable: true })
    error_message!: string;
}