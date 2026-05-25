import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({name: 'ai_settings', schema: 'solidsearchdb'})
export class AiSettings {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    provider_code: string;

    @Column({ nullable: true })
    model_name: string;

    @Column({ nullable: true })
    api_key: string;

    @Column({ nullable: true })
    base_url: string;

    @Column({ nullable: true })
    is_active: boolean;

    @UpdateDateColumn()
    updated_at: Date;
}