import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'search_queries', schema: 'solidsearchdb' })
export class SearchQuery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId: number;

  @Column({ nullable: true, default: 'manual' })
  query_type: string;

  @Column({ name: 'query_text', type: 'text', nullable: true })
  queryText: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}