import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name:'document_files', schema: 'solidsearchdb'})
export class DocumentFiles {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    document_id!: number;

    @Column()
    file_name!: string;

    @Column()
    file_type!: string;

    @Column()
    file_path!: string;

    @Column()
    file_size!: number;

    @Column()
    page_count!: number;

    @CreateDateColumn({ type: 'timestamp', name: 'uploaded_at' })
    uploaded_at!: Date;
}