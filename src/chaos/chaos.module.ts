import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChaosController } from './chaos.controller';
import { Player } from 'src/player/player.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Player])],
  controllers: [ChaosController],
})
export class ChaosModule {}
