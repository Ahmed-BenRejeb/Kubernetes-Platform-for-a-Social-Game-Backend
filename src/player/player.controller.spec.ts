import { Test, TestingModule } from '@nestjs/testing';
import { GamePlayerController } from './player.controller';

describe('PlayerController', () => {
  let controller: GamePlayerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamePlayerController],
    }).compile();

    controller = module.get<GamePlayerController>(GamePlayerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
