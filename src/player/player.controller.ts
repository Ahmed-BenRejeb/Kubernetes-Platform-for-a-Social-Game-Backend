import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PlayerService } from './player.service';
import { KillTargetDto } from './dto/kill-target.dto';
import { JoinGameDto } from './dto/join-game.dto';

@ApiTags('Players')
@Controller('games/:gameId/players')
export class GamePlayerController {
    constructor(private readonly playerService: PlayerService) {}

    @Get()
    @ApiOperation({ summary: 'Get all players in a game' })
    @ApiParam({ name: 'gameId', type: Number, example: 1 })
    getPlayers(@Param('gameId', ParseIntPipe) gameId: number) {
        return this.playerService.getPlayers(gameId);
    }
    @Get("alive")
    @ApiOperation({ summary: 'Get alive players in a game' })
    @ApiParam({ name: 'gameId', type: Number, example: 1 })
    getAlivePlayers(@Param('gameId', ParseIntPipe) gameId: number) {
        return this.playerService.getAlivePlayers(gameId);
    }
    @Get("leaderboard")
    @ApiOperation({ summary: 'Get game leaderboard' })
    @ApiParam({ name: 'gameId', type: Number, example: 1 })
    getLeaderboard(@Param('gameId', ParseIntPipe) gameId: number) {
        return this.playerService.getLeaderboard(gameId);
    }
    @Post('standalone/:playerId')
    @ApiOperation({ summary: 'Standalone player joins a game' })
    @ApiParam({ name: 'gameId', type: Number, example: 1 })
    @ApiParam({ name: 'playerId', type: Number, example: 5 })
    joinStandalonePlayerToGame(
  @Param('playerId', ParseIntPipe) playerId: number,
  @Param('gameId', ParseIntPipe) gameId: number
) {
  return this.playerService.joinStandaloneGame(playerId, gameId);
}
    



    @Put(':playerId/location')
    @ApiOperation({ summary: 'Update player location', description: 'Updates player GPS coordinates and checks proximity to target' })
    @ApiParam({ name: 'gameId', type: Number, example: 1 })
    @ApiParam({ name: 'playerId', type: Number, example: 5 })
    @ApiBody({
        schema: {
            properties: {
                latitude: { type: 'number', example: 37.7749 },
                longitude: { type: 'number', example: -122.4194 },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Location updated, returns proximity info' })
    @ApiResponse({ status: 404, description: 'Player not found' })
    updateLocation(
        @Param('gameId', ParseIntPipe) gameId: number,
        @Param('playerId', ParseIntPipe) playerId: number,
        @Body('latitude') latitude: number,
        @Body('longitude') longitude: number,
    ) {
        return this.playerService.updateLocation(playerId, latitude, longitude);
    }

    @Get(':playerId/proximity')
    @ApiOperation({ summary: 'Check proximity to target', description: 'Returns distance to target and nearby status' })
    @ApiParam({ name: 'gameId', type: Number, example: 1 })
    @ApiParam({ name: 'playerId', type: Number, example: 5 })
    @ApiResponse({ status: 200, description: 'Proximity information' })
    checkProximity(
        @Param('gameId', ParseIntPipe) gameId: number,
        @Param('playerId', ParseIntPipe) playerId: number,
    ) {
        return this.playerService.checkProximity(playerId);
    }    



    
    
    @Post('join')
    @ApiOperation({ summary: 'Join a game with nickname' })
    @ApiParam({ name: 'gameId', type: Number, example: 1 })
    @ApiBody({ type: JoinGameDto })
    joinGame(@Param('gameId', ParseIntPipe) gameId: number, @Body() dto: JoinGameDto) {
        return this.playerService.joinGame(gameId, dto.nickname);
    }

    @Post('assign-targets')
    @ApiOperation({ summary: 'Assign targets to players' })
    @ApiParam({ name: 'gameId', type: Number, example: 1 })
    assignTargets(@Param('gameId', ParseIntPipe) gameId: number) {
        return this.playerService.assignInitialTargets(gameId);
    }

    @Post(':playerId/kill')
    @ApiOperation({ summary: 'Eliminate target player' })
    @ApiParam({ name: 'gameId', type: Number, example: 1 })
    @ApiParam({ name: 'playerId', type: Number, example: 5 })
    @ApiBody({ type: KillTargetDto })
    killTarget(
        @Param('gameId', ParseIntPipe) gameId: number,
        @Param('playerId', ParseIntPipe) playerId: number,
        @Body() dto: KillTargetDto
    ) {
        return this.playerService.killTarget(playerId, dto.targetCode);
    }

    @Patch(':playerId/nickname')
    @ApiOperation({ summary: 'Change player nickname in game' })
    @ApiParam({ name: 'gameId', type: Number, example: 1 })
    @ApiParam({ name: 'playerId', type: Number, example: 5 })
    @ApiBody({ schema: { properties: { newNickname: { type: 'string', example: 'NewNick' } } } })
    changeNickname(
        @Param('gameId', ParseIntPipe) gameId: number,
        @Param('playerId', ParseIntPipe) playerId: number,
        @Body('newNickname') newNickname: string,
    ) {
        return this.playerService.changePlayerNickname(gameId, playerId, newNickname);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a player from game' })
    @ApiParam({ name: 'gameId', type: Number, example: 1 })
    @ApiParam({ name: 'id', type: Number, example: 5 })
    deletePlayer(@Param('gameId', ParseIntPipe) gameId: number, @Param('id', ParseIntPipe) id: number) {
        return this.playerService.deletePlayer(gameId, id);
    }

    @Delete()
    @ApiOperation({ summary: 'Delete all players from game' })
    @ApiParam({ name: 'gameId', type: Number, example: 1 })
    deleteAllPlayers(@Param('gameId', ParseIntPipe) gameId: number) {
        return this.playerService.deleteAllPlayers(gameId);
    }
}