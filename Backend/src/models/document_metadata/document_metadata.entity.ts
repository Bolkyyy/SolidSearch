import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Documents } from "../documents/documents.entity";

@Entity({ name: 'document_metadata', schema: 'solidsearchdb' })
export class DocumentMetadata {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    document_id!: number;

    @Column()
    contractor_name!: string;

    @Column()
    contract_number!: string;

    @Column()
    total_amount!: number;

    @Column()
    responsible_person!: string;

    @Column({ type: 'jsonb', nullable: true })
    extra_json!: object | null;

    @ManyToOne(() => Documents, (doc) => doc.metadata)
    @JoinColumn({ name: 'document_id' })
    document: Documents;
}