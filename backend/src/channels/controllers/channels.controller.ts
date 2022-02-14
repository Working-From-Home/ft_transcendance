import { Controller, Param, ParseIntPipe, Post, UseGuards, Req, Body, Patch, Delete, Put } from '@nestjs/common';
import { CurrentUserGuard } from 'src/auth/guards/current-user.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Channel } from '../entities/channel.entity';
import { createParamDecorator } from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { CreateChannelDto } from '../dtos/create-channel.dto';
import { UserChannel } from '../entities/user-channel.entity';
import { UpdateResult } from 'typeorm';

@Controller()
@UseGuards(JwtAuthGuard)
export class ChannelsController {
	constructor(private chatService: ChatService) { }

	@Post('/dm/:destId')
	async createDm(
		@Req() request,
		@Param('destId', ParseIntPipe) destId: number
	): Promise<Channel> {
		return await this.chatService.createDm(parseInt(request.user.sub), destId);
	}

	@Post('/channels')
	async createChannel(
		@Req() request,
		@Body() data: CreateChannelDto
	): Promise<Channel> {
		return await this.chatService.createChannel(parseInt(request.user.sub), data);
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
		@Param('channelId') channelId: number
	): Promise<UserChannel> {
		return await this.chatService.joinChannel(channelId, parseInt(request.user.sub));
	}

	@Delete('/channels/:channelId')
	async leaveChannel(
		@Req() request,
		@Param('channelId') channelId: number
	): Promise<UpdateResult> {
		return await this.chatService.leaveChannel(channelId, parseInt(request.user.sub));
	}

	@Put('/channels/:channelId/mute/:userId')
	async muteUser(
		@Req() request,
		@Param('channelId') channelId: number,
		@Param('userId') userId: number,
		@Body() date: Date
	): Promise<UpdateResult> {
		const adminId = parseInt(request.user.sub);
		if (!date)
			return await this.chatService.unmuteUser(channelId, adminId, userId);
		return await this.chatService.muteUser(channelId, adminId, userId, date);
	}

	@Put('/channels/:channelId/ban/:userId')
	async banUser(
		@Req() request,
		@Param('channelId') channelId: number,
		@Param('userId') userId: number,
		@Body() date: Date
	): Promise<UpdateResult> {
		const adminId = parseInt(request.user.sub);
		if (!date)
			return await this.chatService.unbanUser(channelId, adminId, userId);
		return await this.chatService.banUser(channelId, adminId, userId, date);
	}

	@Put('/channels/:channelId/admin/:userId')
	async addAdmin(
		@Req() request,
		@Param('channelId') channelId: number,
		@Param('userId') userId: number,
	): Promise<UpdateResult> {
		return await this.chatService.addAdmin(channelId, parseInt(request.user.sub), userId);
	}

	@Delete('/channels/:channelId/admin/:userId')
	async removeAdmin(
		@Req() request,
		@Param('channelId') channelId: number,
		@Param('userId') userId: number,
	): Promise<UpdateResult> {
		return await this.chatService.removeAdmin(channelId, parseInt(request.user.sub), userId);
	}
}