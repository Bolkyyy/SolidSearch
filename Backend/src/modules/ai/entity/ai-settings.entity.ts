import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({name: 'ai_settings', schema: 'solidsearchdb'})
export class AiSettings {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    provider_code: string;

    @Column()
    model_name: string;

    @Column()
    api_key: string;

    @Column()
    base_url: string;

    @Column()
    is_active: boolean;

    @UpdateDateColumn()
    updated_at: Date;
}