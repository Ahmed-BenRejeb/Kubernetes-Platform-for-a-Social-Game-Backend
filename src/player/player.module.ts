import { Module } from '@nestjs/common';
import { PlayerService } from './player.service';
import { GamePlayerController } from './player.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './player.entity';
import { Game } from 'src/game/game.entity';
import { GlobalPlayerController } from './global-player.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Player,Game])],
  providers: [PlayerService],
  controllers: [GamePlayerController,GlobalPlayerController],
  exports: [PlayerService],
})
export class PlayerModule {}
