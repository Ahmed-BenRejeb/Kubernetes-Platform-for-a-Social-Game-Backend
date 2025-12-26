import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { PlayerService } from './player.service';
import { KillTargetDto } from './dto/kill-target.dto';
import { JoinGameDto } from './dto/join-game.dto';

@ApiTags('Players')
@Controller('games/:gameId/players')
export class GamePlayerController {
    constructor(private readonly playerService: PlayerService) {}

    @Get()
    @ApiParam({ name: 'gameId', type: Number, example: 1 })
    getPlayers(@Param('gameId', ParseIntPipe) gameId: number) {
        return this.playerService.getPlayers(gameId);
    }
    @Get("alive")
    @ApiParam({ name: 'gameId', type: Number, example: 1 })
    getAlivePlayers(@Param('gameId', ParseIntPipe) gameId: number) {
        return this.playerService.getAlivePlayers(gameId);
    }
    @Get("leaderboard")
    @ApiParam({ name: 'gameId', type: Number, example: 1 })
    getLeaderboard(@Param('gameId', ParseIntPipe) gameId: number) {
        return this.playerService.getLeaderboard(gameId);
    }
    @Post('standalone/:playerId')
    @ApiParam({ name: 'gameId', type: Number, example: 1 })
    @ApiParam({ name: 'playerId', type: Number, example: 5 })
    joinStandalonePlayerToGame(
  @Param('playerId', ParseIntPipe) playerId: number,
  @Param('gameId', ParseIntPipe) gameId: number
) {
  return this.playerService.joinStandaloneGame(playerId, gameId);
}
    
    
    
    @Post('join')
    @ApiParam({ name: 'gameId', type: Number, example: 1 })
    @ApiBody({ type: JoinGameDto })
    joinGame(@Param('gameId', ParseIntPipe) gameId: number, @Body() dto: JoinGameDto) {
        return this.playerService.joinGame(gameId, dto.nickname);
    }

    @Post('assign-targets')
    @ApiParam({ name: 'gameId', type: Number, example: 1 })
    assignTargets(@Param('gameId', ParseIntPipe) gameId: number) {
        return this.playerService.assignInitialTargets(gameId);
    }

    @Post(':playerId/kill')
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
    @ApiParam({ name: 'gameId', type: Number, example: 1 })
    @ApiParam({ name: 'id', type: Number, example: 5 })
    deletePlayer(@Param('gameId', ParseIntPipe) gameId: number, @Param('id', ParseIntPipe) id: number) {
        return this.playerService.deletePlayer(gameId, id);
    }

    @Delete()
    @ApiParam({ name: 'gameId', type: Number, example: 1 })
    deleteAllPlayers(@Param('gameId', ParseIntPipe) gameId: number) {
        return this.playerService.deleteAllPlayers(gameId);
    }
}