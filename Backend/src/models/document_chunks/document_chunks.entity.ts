import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'document_chunks', schema: 'solidsearchdb'})
export class DocumentChunks{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    page_id!: number;

    @Column()
    document_id!: number;

    @Column()
    chunk_index!: number;

    @Column()
    chunk_text!: string;

    @Column()
    token_count!: number;

    @Column()
    chunk_hash!: string;
}