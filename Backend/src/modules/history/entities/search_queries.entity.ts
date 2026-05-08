import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name:'search_queries', schema: 'solidsearchdb'})
export class SearchQueries {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    user_id: number;

    @Column()
    query_text: string;
    
    @Column()
    query_type: string;

    @Column({ type: 'json', nullable: true })
    filters_json: any;

    @CreateDateColumn()
    created_at: Date;
}