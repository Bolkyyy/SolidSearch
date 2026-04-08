import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: "document_sources", schema: "solidsearchdb"})
export class DocumentSources {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    source_type!: string;

    @Column()
    description!: string;

    @Column()
    is_active!: boolean;
}