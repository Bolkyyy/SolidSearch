import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name:'generated_answer', schema: 'solidsearchdb'})
export class GeneratedAnswer{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    query_id!: number;

    @Column()
    answer_text!: string;

    @Column()
    model_name!: string;

    @Column({type: "decimal", precision: 5, scale: 4 })
    confidence_score!: number;

    @CreateDateColumn({ type: "timestamp", name: "created_at" } )
    created_at!: Date;
}