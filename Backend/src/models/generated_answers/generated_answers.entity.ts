import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'generated_answers', schema: 'solidsearchdb' })
export class GeneratedAnswers {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  query_id!: number;

  @Column()
  answer_text!: string;

  @Column()
  model_name!: string;

  @Column()
  confidence_score!: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at!: Date;
}
