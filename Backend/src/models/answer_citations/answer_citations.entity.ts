import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name:'answer_citations', schema: 'solidsearchdb'})
export class AnswerCitations{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    answer_id!: number;

    @Column()
    chunk_id!: number;

    @Column()
    document_id!: number;

    @Column()
    cited_fragment!: string;

    @Column()
    citation_order!: number;
}