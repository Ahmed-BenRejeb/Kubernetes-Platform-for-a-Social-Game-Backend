import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Game } from './game.entity';
import { Player } from 'src/player/player.entity';
import { GameGateway } from './game.gateway';

describe('GameService', () => {
  let service: GameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        {
          provide: getRepositoryToken(Game),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Player),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: GameGateway,
          useValue: {
            notifyGameStarted: jest.fn(),
            notifyGameFinished: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});