import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Connection, Repository } from 'typeorm'
import { User } from '../entities/user.entity';
import { AvatarService } from './avatar.service';
import * as avatarholder from 'avatarholder';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private repo: Repository<User>,
        private readonly avatarService: AvatarService,
        private connection: Connection
    ) {}

    async create(email: string, username: string, password: string) {
        const avatar = await this.generateDefaultAvatar(username, 400);
        const user = this.repo.create({ email, username, password, avatar });
        return this.repo.save(user);
    }

    private async generateDefaultAvatar(username: string, size: number) {
        const img = avatarholder.generateAvatar(username, { size: size });
        const base64 = img.replace(/^data:image\/png;base64,/, "");
        const buffer = Buffer.from(base64, 'base64');
        const queryRunner = this.connection.createQueryRunner();
        return await this.avatarService.uploadAvatar(buffer, 'default.png', 'image/png', queryRunner);
    }

    async remove(id: number) {
        const user = await this.findById(id);
        if (!user) { throw new NotFoundException('user not found'); }
        return await this.avatarService.removeAvatar(user.avatarId);
    }

    findById(id: number) {
        if (!id) { return null; }
        return this.repo.findOne(id);
    }

    async findByEmail(email: string) {
        const users = await this.repo.find({ email });
        if (users.length === 0) { return null; }
        return users[0];
    }

    async findByName(username: string) {
        const users = await this.repo.find({ username });
        if (users.length === 0) { return null; }
        return users[0];
    }

    async updateAvatar(id: number, imageBuffer: Buffer, filename: string, mimetype: string) {
        const user = await this.findById(id);
        if (!user) { throw new  NotFoundException('user not found'); }
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const currentAvatarId = user.avatarId;
            const avatar = await this.avatarService.uploadAvatar(imageBuffer, filename, mimetype, queryRunner);
            await queryRunner.manager.update(User, id, { avatarId: avatar.id });
            if (currentAvatarId) {
                await this.avatarService.deleteAvatar(currentAvatarId, queryRunner);
            }
            await queryRunner.commitTransaction();
            return avatar;
        } catch {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException();
        } finally {
            await queryRunner.release();
        }
    }
}