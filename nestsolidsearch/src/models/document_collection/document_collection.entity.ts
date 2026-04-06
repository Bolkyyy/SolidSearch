import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name:'document_collection', schema: 'solidsearchdb'})
export class DocumentCollection {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    source_id!: number;

    @Column()
    name!: string;

    @Column()
    code!: string;

    @Column()
    description!: string;

    @Column()
    is_active!: boolean;

}