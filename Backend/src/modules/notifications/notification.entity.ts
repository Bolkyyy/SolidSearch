import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'notifications', schema: 'solidsearchdb' })
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  user_id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: 'info' })
  category: string;

  @Column({ default: false })
  is_read: boolean;

  @Column({ nullable: true })
  link: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
