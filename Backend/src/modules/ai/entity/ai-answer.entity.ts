import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'ai_answers', schema: 'solidsearchdb'})
export class AiAnswers {
    @PrimaryGeneratedColumn()
    answer_id: number;

    @Column()
    query_id: number;

    @Column()
    answer_text: string;

    @Column()
    provider_code: string;

    @Column()
    model_name: string;

    @Column('decimal', { precision: 10, scale: 2 })
    confidence_score: number;

    @CreateDateColumn()
    created_at: Date;

    @Column()
    citation_document_id: number;

    @Column()
    citation_fragment: string;
}