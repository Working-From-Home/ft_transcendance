import { Entity, Column, OneToOne, JoinColumn, PrimaryColumn, Check } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Stats {
    @PrimaryColumn()
    userId: number;

    @OneToOne(() => User, (user) => user.stats, { onDelete: "CASCADE" })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ default: 0 })
    @Check(`"xp" >= 0`)
    xp: number;

    @Column({ default: 0 })
    @Check(`"victories" >= 0`)
    victories: number;

    @Column({ default: 0 })
    @Check(`"losses" >= 0`)
    losses: number;
}