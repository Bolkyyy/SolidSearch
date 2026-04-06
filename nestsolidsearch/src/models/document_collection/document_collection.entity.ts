import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name:'document_collections', schema: 'solidsearchdb'})
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