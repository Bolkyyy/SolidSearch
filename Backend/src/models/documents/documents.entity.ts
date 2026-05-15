import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DocumentFiles } from "../document_files/document_files.entity";

@Entity({ name: 'documents', schema: 'solidsearchdb' })
export class Documents {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: true })
    collection_id: number;

    @Column({ nullable: true })
    title: string;

    @Column({ nullable: true })
    document_type: string;

    @Column({ nullable: true })
    archive_number: string;

    @Column({ type: 'timestamp', nullable: true })
    document_date: Date;

    @Column({ nullable: true })
    author_name: string;

    @Column({ nullable: true })
    status: string;

    @Column({ nullable: true })
    language: string;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    created_at: Date;

    @OneToMany(() => DocumentFiles, file => file.document)
    files: DocumentFiles[];
}