import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn, CreateDateColumn } from "typeorm";
import { User } from "./user.entity";

export enum FriendshipStatus {
    Accepted = 'accepted',
    Declined = 'declined'
}

@Entity()
export class Friendship {
    @PrimaryColumn()
    applicantId: number;

    @PrimaryColumn()
    recipientId: number;

    @Column({ default: 'pending'})
    status: string;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(() => User, user => user.sentFriendRequests, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'applicantId' })
    applicant: User;

    @ManyToOne(() => User, user => user.receivedFriendRequests, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'recipientId' })
    recipient: User;
}