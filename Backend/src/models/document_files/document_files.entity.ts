import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Documents } from "../documents/documents.entity";

@Entity({ name: 'document_files', schema: 'solidsearchdb' })
export class DocumentFiles {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: true })
    document_id: number;

    @Column({ nullable: true })
    file_name: string;

    @Column({ nullable: true })
    file_type: string;

    @Column({ type: 'text', nullable: true })
    file_path: string;

    @Column({ nullable: true })
    file_size: number;

    @Column({ nullable: true })
    page_count: number;

    @UpdateDateColumn({ type: 'timestamp', name: 'uploaded_at' })
    uploaded_at!: Date;

    @Column({ type: 'text', nullable: true })
    extracted_text: string;

    @Column({ type: 'text', nullable: true })
    normalized_text: string;

    @Column({ nullable: true })
    extraction_status: string;

    @ManyToOne(() => Documents, doc => doc.files)
    @JoinColumn({ name: 'document_id' })
    document: Documents;
}