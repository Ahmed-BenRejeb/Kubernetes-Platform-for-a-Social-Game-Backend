import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PlayerService } from './player.service';
import { CreatePlayerDto } from './dto/create-player.dto';

@ApiTags('Players')
@Controller('players')
export class GlobalPlayerController {
    constructor(private readonly playerService: PlayerService) {}

    @Get()
    @ApiOperation({ summary: 'Get all players' })
    getAllPlayers() {
        return this.playerService.getAllPlayers();
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