import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name:'search_queries', schema: 'solidsearchdb'})
export class SearchQueries {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: true })
    user_id: number;

    @Column({ nullable: true })
    query_text: string;
    
    @Column({ nullable: true })
    query_type: string;

    @Column({ type: 'json', nullable: true })
    filters_json: any;

    @CreateDateColumn()
    created_at: Date;
}