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

    @Column({ nullable: true })
    status: string;

    @Column({ nullable: true })
    result_count: number;

    @Column({ type: 'json', nullable: true })
    filters_json: any;

    @Column({ type: 'float', nullable: true })
    response_time_ms: number;

    @CreateDateColumn()
    created_at: Date;
}