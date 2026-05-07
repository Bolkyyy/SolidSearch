import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'search_queries', schema: 'solidsearchdb' })
export class SearchQuery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'query_text', type: 'text' })
  queryText: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}