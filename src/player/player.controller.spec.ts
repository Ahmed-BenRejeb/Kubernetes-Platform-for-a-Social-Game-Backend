import { Test, TestingModule } from '@nestjs/testing';
import { GamePlayerController } from './player.controller';
import { PlayerService } from './player.service';

describe('PlayerController', () => {
  let controller: GamePlayerController;
  let service: PlayerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamePlayerController],
      providers: [
        {
          provide: PlayerService,
          useValue: {
            getPlayers: jest.fn(),
            getAlivePlayers: jest.fn(),
            getLeaderboard: jest.fn(),
            joinGame: jest.fn(),
            assignInitialTargets: jest.fn(),
            killTarget: jest.fn(),
            changePlayerNickname: jest.fn(),
            deletePlayer: jest.fn(),
            deleteAllPlayers: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GamePlayerController>(GamePlayerController);
    service = module.get<PlayerService>(PlayerService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});