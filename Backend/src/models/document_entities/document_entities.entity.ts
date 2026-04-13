import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'document_entities', schema: 'solidsearchdb'})
export class DocumentEntities {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    document_id!: number;

    @Column()
    entity_id!: number;

    @Column()
    extracted_value!: string;

    @Column()
    normalized_value!: string;

    @Column({type: "decimal", precision: 5, scale: 4 })
    confidence_score!: number;

    @Column()
    page_number!: number;
}