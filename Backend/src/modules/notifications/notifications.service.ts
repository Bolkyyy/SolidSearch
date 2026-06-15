import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Notification } from './notification.entity';

export interface CreateNotificationDto {
  userId: number | null;
  title: string;
  message: string;
  category?: 'info' | 'success' | 'warning' | 'system';
  link?: string;
}

@Injectable()
export class NotificationsService implements OnModuleInit {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS solidsearchdb.notifications (
        id        SERIAL PRIMARY KEY,
        user_id   INTEGER,
        title     VARCHAR(255) NOT NULL,
        message   TEXT NOT NULL,
        category  VARCHAR(50) NOT NULL DEFAULT 'info',
        is_read   BOOLEAN NOT NULL DEFAULT FALSE,
        link      VARCHAR(500),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await this.dataSource.query(`
      ALTER TABLE solidsearchdb.notifications
      ADD COLUMN IF NOT EXISTS user_id INTEGER
    `);
    await this.dataSource.query(`
      DELETE FROM solidsearchdb.notifications WHERE user_id IS NULL
    `);
  }

  async findAll(userId: number): Promise<Notification[]> {
    return this.dataSource.query(
      `SELECT * FROM solidsearchdb.notifications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId],
    );
  }

  async create(dto: CreateNotificationDto): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO solidsearchdb.notifications (user_id, title, message, category, link, is_read)
       VALUES ($1, $2, $3, $4, $5, FALSE)`,
      [dto.userId, dto.title, dto.message, dto.category ?? 'info', dto.link ?? null],
    );
  }

  async markAsRead(id: number, userId: number): Promise<void> {
    await this.dataSource.query(
      `UPDATE solidsearchdb.notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2`,
      [id, userId],
    );
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.dataSource.query(
      `UPDATE solidsearchdb.notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE`,
      [userId],
    );
  }

  async remove(id: number, userId: number): Promise<void> {
    await this.dataSource.query(
      `DELETE FROM solidsearchdb.notifications WHERE id = $1 AND user_id = $2`,
      [id, userId],
    );
  }

  async clearAll(userId: number): Promise<void> {
    await this.dataSource.query(
      `DELETE FROM solidsearchdb.notifications WHERE user_id = $1`,
      [userId],
    );
  }
}
