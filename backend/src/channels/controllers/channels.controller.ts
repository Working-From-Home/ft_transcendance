import { Controller, Param, ParseIntPipe, Post, UseGuards, Req, Body, Patch, Delete, Put, Get } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Channel } from '../entities/channel.entity';
import { ChatService } from '../services/chat.service';
import { CreateChannelDto } from '../dtos/create-channel.dto';
import { UserChannel } from '../entities/user-channel.entity';
import { UpdateResult } from 'typeorm';
import { Blocked } from '../../users/entities/blocked.entity';
import { AppGateway } from 'src/app.gateway';
import { IMessage } from 'shared/models/socket-events';

@Controller()
@UseGuards(JwtAuthGuard)
export class ChannelsController {
	constructor(private chatService: ChatService,
				private readonly appGateway: AppGateway
				) { }

	@Post('/dm/:destId')
	async createDm(
		@Req() request,
		@Param('destId', ParseIntPipe) destId: number
	): Promise<Channel> {
		const user = this.appGateway.server.in(`user:${request.user.sub}` );
		const user2 = this.appGateway.server.in(`user:${destId}` );
		let newChannel = await this.chatService.createDm(parseInt(request.user.sub), destId);
		user.socketsJoin(`channel:${newChannel.id}`);
		user2.socketsJoin(`channel:${newChannel.id}`);
		this.chatService.getChannel(newChannel.id).then( (y) => {
		 	this.appGateway.server.in("channel:" + newChannel.id).emit("sendChannel", y);
		})
		return newChannel;
	}

	@Post('/channels')
	async createChannel(
		@Req() request,
		@Body() data: CreateChannelDto
	): Promise<Channel> {
		const user = this.appGateway.server.in(`user:${request.user.sub}` );
		let newChannel = await this.chatService.createChannel(parseInt(request.user.sub), data);
		user.socketsJoin(`channel:${newChannel.id}`);
		this.chatService.getChannel(newChannel.id).then( (y) => {
		 	this.appGateway.server.in("channel:" + newChannel.id).emit("sendChannel", y);
		})
		return newChannel;
	}

	@Post('/channels/:channelId/messages')
	async createMessage(
		@Req() request,
		@Param('channelId') channelId: number,
		@Body() content: any
	): Promise<IMessage[]> {
		let tmpMessage = await this.chatService.createMessage(channelId, request.user.sub, content);
		let newMessage: IMessage[];
		newMessage = [{
			_id: tmpMessage.id,
			username: tmpMessage.user.username,
			content: tmpMessage.content,
			createdAt: tmpMessage.createdAt.toString(),
			date: tmpMessage.createdAt.toDateString(),
			senderId: tmpMessage.user.id,
			channelId: tmpMessage.channel.id,
			deleted: null
		}]
		this.appGateway.server.in("channel:" + channelId).emit("sendMessage", newMessage);
		return newMessage;
	}

	@Patch('/channels/:channelId')
	async updateChannel(
		@Param('channelId') channelId: number,
		@Body() data: CreateChannelDto
	): Promise<UpdateResult> {
		return await this.chatService.updateChannel(channelId, data);
	}

	@Put('/channels/:channelId')
	async joinChannel(
		@Req() request,
		@Param('channelId') channelId: number,
		@Body() data: any
	): Promise<UserChannel> {
		let newUserChannel : UserChannel;
		newUserChannel = await this.chatService.joinChannel(channelId, parseInt(request.user.sub), data);
		if (newUserChannel === null)
			return null;
		const user = this.appGateway.server.in(`user:${request.user.sub}` );
		user.socketsJoin(`channel:${channelId}`);
		this.chatService.getChannel(channelId).then( (y) => {
		 	this.appGateway.server.in("channel:" + channelId).emit("sendChannel", y);
		})
		return newUserChannel;
	}

	@Delete('/channels/:channelId')
    async leaveChannel(
        @Req() request,
        @Param('channelId') channelId: number ) {
        await this.chatService.leaveChannel(channelId, parseInt(request.user.sub));
        this.appGateway.server.in(`user:${request.user.sub}` ).socketsLeave(`channel:${channelId}`)
		this.chatService.getChannel(channelId).then( (y) => {
	 	 	this.appGateway.server.in("channel:" + channelId).emit("sendChannel", y);
	 	})
		this.appGateway.server.in("user:" + request.user.sub).emit("leaveChannel", channelId);
    }

	@Put('/channels/:channelId/mute/:userId')
	async muteUser(
		@Req() request,
		@Param('channelId') channelId: number,
		@Param('userId') userId: number,
		@Body() content: {date: Date}
	): Promise<UserChannel>  {
		const adminId = parseInt(request.user.sub);
		let user: UserChannel;
		if (!content.date){
			user = await this.chatService.unmuteUser(channelId, adminId, userId);
			this.appGateway.server.in("user:" + userId).emit("changeParam", "unmute", channelId, userId, null);
		}
		else {
			user = await this.chatService.muteUser(channelId, adminId, userId, content.date);
			this.chatService.getChannel(channelId).then( (y) => {
				this.appGateway.server.in("channel:" + channelId).emit("sendChannel", y);
			})
			this.appGateway.server.in("user:" + userId).emit("changeParam", "mute", channelId, userId, content.date);
		}
		return user;
	}

	@Put('/channels/:channelId/ban/:userId')
	async banUser(
		@Req() request,
		@Param('channelId') channelId: number,
		@Param('userId') userId: number,
		@Body() content: {date: Date}
	): Promise<UserChannel> {
		const adminId = parseInt(request.user.sub);
		let user: UserChannel;
		if (!content.date){
			user = await this.chatService.unbanUser(channelId, adminId, userId);
			this.appGateway.server.in(`user:${userId}`).socketsLeave(`channel:${channelId}`)
			this.chatService.getChannel(channelId).then( (y) => {
				this.appGateway.server.in("channel:" + channelId).emit("sendChannel", y);
			})
			this.appGateway.server.in("user:" + userId).emit("changeParam", "unban", channelId, userId, null);
		}
		else { 
			user = await this.chatService.banUser(channelId, adminId, userId, content.date)
			this.appGateway.server.in(`user:${userId}`).socketsJoin(`channel:${channelId}`)
			this.chatService.getChannel(channelId).then( (y) => {
				this.appGateway.server.in("channel:" + channelId).emit("sendChannel", y);
			})
			this.appGateway.server.in("user:" + userId).emit("changeParam", "ban", channelId, userId, content.date);
		}
		return user;
	}

	@Put('/channels/:channelId/admin/:userId')
	async addAdmin(
		@Req() request,
		@Param('channelId') channelId: number,
		@Param('userId') userId: number,
	) {
		await this.chatService.addAdmin(channelId, parseInt(request.user.sub), userId);
		this.chatService.getChannel(channelId).then( (y) => {
			this.appGateway.server.in("channel:" + channelId).emit("sendChannel", y);
		})
		this.appGateway.server.in("user:" + userId).emit("changeParam", "admin", channelId, userId, null);
		return ;
	}

	@Delete('/channels/:channelId/admin/:userId')
	async removeAdmin(
		@Req() request,
		@Param('channelId') channelId: number,
		@Param('userId') userId: number,
	): Promise<UserChannel> {
		return await this.chatService.removeAdmin(channelId, parseInt(request.user.sub), userId);
	}

	@Post('/block/:recipientId')
    async blockUser(
		@Req() request,
        @Param('recipientId', ParseIntPipe) recipientId: number
    ): Promise<Blocked>{
		let block = await this.chatService.blockUser(request.user.sub, recipientId);
		this.appGateway.server.in("user:" + request.user.sub).emit("changeParam", "block", 0, recipientId, block.createdAt);
        return block
    }

	@Delete('/block/:recipientId')
    async unblockUser(
		@Req() request,
        @Param('recipientId', ParseIntPipe) recipientId: number
    ): Promise<Blocked[]> {
		const unblock = await this.chatService.getBlocked(request.user.sub, recipientId);
		this.appGateway.server.in("user:" + request.user.sub).emit("changeParam", "unblock", 0, recipientId, null);
        return await this.chatService.unBlockUser(unblock);
    }

	@Get('/block')
    async getblock( @Req() request ): Promise<Blocked[]> {
        let users = await this.chatService.isBlocked(request.user.sub);
        return users;
    }
}
