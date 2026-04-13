import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name:'search_results', schema: 'solidsearchdb'})
export class SearchResults{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    query_id!: number;

    @Column()
    document_id!: number;

    @Column()
    chunk_id!: number;

    @Column({type: "decimal", precision: 5, scale: 4 })
    relevance_score!: number;

    @Column()
    rank_order!: number;

}