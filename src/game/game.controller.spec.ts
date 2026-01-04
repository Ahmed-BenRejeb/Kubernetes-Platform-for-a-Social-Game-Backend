import { Test, TestingModule } from '@nestjs/testing';
import { GameController } from './game.controller';
import { GameService } from './game.service';

describe('GameController', () => {
  let controller: GameController;
  let service: GameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameController],
      providers: [
        {
          provide: GameService,
          useValue: {
            createGame: jest.fn(),
            getGames: jest.fn(),
            getGameById: jest.fn(),
            startGame: jest.fn(),
            finishGame: jest.fn(),
            deleteGame: jest.fn(),
            getGameResult: jest.fn(),
            deleteAllGames: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GameController>(GameController);
    service = module.get<GameService>(GameService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});