import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class SearchQuerie {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    user_id!: number;

    @Column()
    query_text!: string;
    
    @Column()
    query_type!: string;

    @Column()
    filters_json!: string;

    @Column({type: 'timestamp', name: 'created_at'})
    created_at!: Date;
}