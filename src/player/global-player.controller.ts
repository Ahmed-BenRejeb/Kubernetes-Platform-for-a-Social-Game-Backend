import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PlayerService } from './player.service';
import { CreatePlayerDto } from './dto/create-player.dto';

@ApiTags('Players')
@Controller('players')
export class GlobalPlayerController {
    constructor(private readonly playerService: PlayerService) {}

@Get()
  getAllPlayers(
    // Parse query params (e.g. ?page=2&limit=20)
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    // Safety check: Don't let users request 10,000 items
    if (limit > 100) limit = 100;

    return this.playerService.getAllPlayers(page, limit);
  }

    @Post()
    @ApiOperation({ summary: 'Create a standalone player' })
    @ApiBody({ type: CreatePlayerDto })
    createPlayer(@Body() dto: CreatePlayerDto) {
        return this.playerService.createStandalonePlayer(dto.nickname);
    }

    @Patch(':playerId/nickname')
    @ApiOperation({ summary: 'Change standalone player nickname' })
    @ApiParam({ name: 'playerId', type: Number, example: 5 })
    @ApiBody({ schema: { properties: { newNickname: { type: 'string', example: 'NewNick' } } } })
    changeNickname(
        @Param('playerId', ParseIntPipe) playerId: number,
        @Body('newNickname') newNickname: string,
    ) {
        return this.playerService.changePlayerNickname(null, playerId, newNickname);
    }


    @Delete('')
        @ApiOperation({ summary: 'Delete all players ' })

        deleteEveryone() {
            return this.playerService.deleteEveryone();
        }
}