import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name:'documents', schema: 'solidsearchdb'})
export class Documents {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    collection_id!: number;

    @Column()
    title!: string;

    @Column()
    document_type!: string;

    @Column()
    archive_number!: string;

    @Column({ type: 'timestamp' })
    document_date!: Date;

    @Column()
    author_name!: string;

    @Column()
    status!: string;

    @Column()
    language!: string;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    created_at!: Date;
}