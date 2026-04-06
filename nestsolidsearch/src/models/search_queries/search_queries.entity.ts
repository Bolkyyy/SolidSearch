import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name:'search_queries', schema: 'solidsearchdb'})
export class SearchQuerie {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    user_id!: number;

    @Column()
    query_text!: string;
    
    @Column()
    query_type!: string;

    @Column({ type: 'json', nullable: true })
    filters_json!: any;

    @Column({type: 'timestamp', name: 'created_at'})
    created_at!: Date;
}