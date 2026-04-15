import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'document_pages', schema: 'solidsearchdb' })
export class DocumentPages {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    document_id!: number;

    @Column()
    page_number!: number;

    @Column({ type: 'text', nullable: true })
    extracted_text!: string;
}