import { Entity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany, ManyToMany, JoinTable, Check, Index } from "typeorm";
import { Avatar } from "./avatar.entity";
import { Friendship } from "./friendship.entity";
import { Stats } from "./stats.entity";
import { Channel } from "../../channels/entities/channel.entity";
import { Message } from "../../channels/entities/message.entity";
import { UserChannel } from "../../channels/entities/user-channel.entity";
import { Blocked } from "./blocked.entity";
import { Game } from "../../game/entities/game.entity";
import { Exclude } from "class-transformer";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    /* Auth */

    @Column({ unique: true })
    email: string;

    @Column({ unique: true })
    username: string;

    @Column({nullable: true })
    @Exclude()
    password: string | null;

    @Column({ type: "text", nullable: true })
    @Exclude()
    refreshToken: string | null;

    @Column({ type: 'timestamptz', default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;

    /* OAuth */

    @Column({ type: "boolean", default: false })
    twoFaEnabled: boolean;

    @Column({ type: "text", nullable: true })
    twoFaSecret: string | null;
    
    @Index()
    @Column({ type: "text", unique: true, nullable: true})
    @Exclude()
    googleSub: string | null;

    @Column({ type: "text", nullable: true })
    @Exclude()
    googleRefreshToken: string | null;

    @Index()
    @Column({ type: "text", unique: true, nullable: true })
    @Exclude()
    fortyTwoSub: string | null;
    
    @Column({ type: "text", nullable: true })
    @Exclude()
    fortyTwoRefreshToken: string | null;

    /* Avatar */

    @OneToOne(() => Avatar, (avatar) => avatar.user)
    avatar: Avatar;

    /* Stats */

    @OneToOne(() => Stats, (stats) => stats.user)
    stats: Stats;

    get statistics() {
        return {
            level: this.stats.xp,
            victories: this.stats.victories,
            losses: this.stats.losses
        }
    }

    /* Friendships */

    @OneToMany(() => Friendship, (friendRequest) => friendRequest.applicant)
    sentFriendRequests: Friendship[];

    @OneToMany(() => Friendship, (friendRequest) => friendRequest.recipient)
    receivedFriendRequests: Friendship[];

    /* Blocked */

    @OneToMany(() => Blocked, (blocked) => blocked.applicant)
    usersBlocked: Blocked[];

    @OneToMany(() => Blocked, (blocked) => blocked.recipient)
    BlockedBy: Blocked[];

    /* Channels */

    @OneToMany(() => Message, (message) => message.user)
    messages: Message[];

    @OneToMany(() => UserChannel, (userChannel) => userChannel.user)
    userChannels: UserChannel[];

    @OneToMany(() => Channel, (channel) => channel.owner)
    channels: Channel[];

    /* Game */

    @OneToMany(() => Game, (game) => game.looser)
    lossedGames: Game[];

    @OneToMany(() => Game, (game) => game.winner)
    wonGames: Game[];
}
