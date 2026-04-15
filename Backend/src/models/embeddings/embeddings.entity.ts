import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'embeddings', schema: 'solidsearchdb' })
export class Embeddings {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    chunk_id!: number;

    @Column({ nullable: true })
    embedding_model!: string;

    @Column({ type: 'text', nullable: true })
    vector_ref!: string;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    created_at!: Date;
}