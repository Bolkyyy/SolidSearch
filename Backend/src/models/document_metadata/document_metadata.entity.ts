import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
}