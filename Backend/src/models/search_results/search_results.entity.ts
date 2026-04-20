import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name:'search_results', schema: 'solidsearchdb'})
export class SearchResultsEntity{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    query_id!: number;

    @Column()
    document_id!: number;

    @Column()
    relevance_score!: number;

    @Column()
    rank_order!: number;

}