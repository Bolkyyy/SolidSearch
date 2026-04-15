import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name:'entities', schema: 'solidsearchdb'})
export class Entities{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    code!: string;

    @Column()
    value_type!: string;

}