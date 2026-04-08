import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: "index_jobs", schema: "solidsearchdb"})
export class IndexJobs {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    document_id!: number;

    @Column()
    status!: string;

    @Column()
    parser_type!: string;

    @Column({ type: 'timestamp' })
    started_at!: Date

    @Column({ type: 'timestamp' })
    finished_at!: Date

    @Column()
    error_message!: string;
}