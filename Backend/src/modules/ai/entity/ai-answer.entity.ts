import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'ai_answers', schema: 'solidsearchdb'})
export class AiAnswers {
    @PrimaryGeneratedColumn()
    answer_id: number;

    @Column({ nullable: true })
    query_id: number;

    @Column({ nullable: true })
    answer_text: string;

    @Column({ nullable: true })
    provider_code: string;

    @Column({ nullable: true })
    model_name: string;

    @Column('decimal', { precision: 10, scale: 2 } )
    confidence_score: number;

    @CreateDateColumn()
    created_at: Date;

    @Column({ nullable: true })
    citation_document_id: number;

    @Column({ nullable: true })
    citation_fragment: string;

    @Column({ type: 'json', nullable: true })
    document_ids: number[];
}