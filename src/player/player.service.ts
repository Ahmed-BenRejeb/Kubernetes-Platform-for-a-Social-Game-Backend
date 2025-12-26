import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Player } from './player.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Game, GameStatus } from 'src/game/game.entity';


@Injectable()
export class PlayerService {
    constructor(
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
    @InjectRepository(Game)
    private gameRepository: Repository<Game>,
  ) {}

  async getPlayers(gameId: number): Promise<Player[]> {
    const game = await this.gameRepository.findOne({ where: { id: gameId } });
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    return this.playerRepository.find({
    where: {game: {id:gameId}},
    relations: ['game', 'currentTarget'],
  });
  }

  async changePlayerNickname( gameId: number|null, playerId: number, newNickname: string) {
    const player = await this.playerRepository.findOne({ where: { id: playerId }, relations: ['game'] });
    if (!player) {
      throw new NotFoundException('Player not found');
    }
      if (player.game) {
    const existingPlayer = await this.playerRepository.findOne({
      where: { game: { id: player.game.id }, nickname: newNickname },
    });
    
    if (existingPlayer && existingPlayer.id !== playerId) {
      throw new BadRequestException('Nickname already taken in this game');
    }
  }
    player.nickname = newNickname;
    return this.playerRepository.save(player);
  }
    

  async joinGame(gameId: number, nickname: string) 
  {
  const game = await this.gameRepository.findOne({ where: { id: gameId } });
  if (!game) throw new NotFoundException('Game not found');
  if (game.status !== GameStatus.WAITING)
    throw new BadRequestException('Cannot join a game that has started');
  const existingPlayer = await this.playerRepository.findOne({
    where: { game: { id: gameId }, nickname },
  });
  if (existingPlayer) {
    throw new BadRequestException('Nickname already taken in this game');
  }
  let code: string = '';
    let exists = true;
  
while (exists) {
  code = Math.floor(100000 + Math.random() * 900000).toString();
  const existingPlayer = await this.playerRepository.findOne({ 
    where: { game: { id: gameId }, secretCode: code } 
  });
  exists = !!existingPlayer; // convert to boolean
}


  const player = this.playerRepository.create({
    nickname,
    secretCode: code,
    game,
    isAlive: true,
  });

  return this.playerRepository.save(player);
}

async assignInitialTargets(gameId: number) {
  const players = await this.playerRepository.find({
    where: { game: { id: gameId }, isAlive: true },
  });

  if (players.length < 4) throw new BadRequestException('Not enough players');

  // Shuffle players randomly
  const shuffled = players.sort(() => Math.random() - 0.5);

  // Assign targets in a circular way
  for (let i = 0; i < shuffled.length; i++) {
    shuffled[i].currentTarget = shuffled[(i + 1) % shuffled.length];
  }

  await this.playerRepository.save(shuffled);
}
async killTarget(killerId: number, targetCode: string) {
  const killer = await this.playerRepository.findOne({
    where: { id: killerId },
    relations: ['game', 'currentTarget', 'currentTarget.currentTarget'],
  });

  if (!killer) throw new NotFoundException('Player not found');
  if (!killer.game) throw new BadRequestException('Player is not in a game');
  const target = await this.playerRepository.findOne({
    where: { secretCode: targetCode, game: { id: killer.game.id } },
    relations: ['currentTarget'],
  });

  if (!target || !target.isAlive)
    throw new BadRequestException('Invalid target');
  if (killer.currentTarget == null)
    throw new BadRequestException('You have no assigned target');

  if (killer.currentTarget.id !== target.id)
    throw new BadRequestException('This is not your assigned target');

  // Inherit kills
  killer.kills += 1 + target.kills;

  // Update killer's target
  killer.currentTarget = target.currentTarget;

  // Mark target as dead
  target.isAlive = false;
  target.currentTarget = null;

  await this.playerRepository.save([killer, target]);

  // Update other affected players
  await this.reassignTargetsForDead(target.id);
  const alivePlayers = await this.playerRepository.count({
  where: { game: { id: killer.game.id }, isAlive: true },
});

  if (alivePlayers === 1) {
  const game = killer.game;
  game.status = GameStatus.FINISHED;
  game.finishedAt = new Date();
  game.winner = killer;
  await this.gameRepository.save(game);

  return {
    message: 'Game finished',
    winner: killer,
  };
}
  return { message: 'Target eliminated', killer, target };
}


async reassignTargetsForDead(deadPlayerId: number) {
  const affectedPlayers = await this.playerRepository.find({
    where: { currentTarget: { id: deadPlayerId }, isAlive: true },
    relations: ['currentTarget', 'currentTarget.currentTarget'],
  });

  for (const player of affectedPlayers) {
    if (!player.currentTarget) continue;
    let newTarget = player.currentTarget.currentTarget;
    let visited = new Set<number>([player.id, deadPlayerId]);
    // Skip dead targets recursively
    while (newTarget && !newTarget.isAlive || newTarget?.secretCode===player.secretCode) {
        if (visited.has(newTarget.id)) {
        newTarget = null; // Cycle detected
        break;
      }
      visited.add(newTarget.id);
        newTarget = newTarget.currentTarget;
    }

    player.currentTarget = newTarget || null;
  }

  await this.playerRepository.save(affectedPlayers);
}
async createStandalonePlayer(nickname: string) {
    const player = this.playerRepository.create({
      nickname,
      isAlive: true,
      secretCode: Math.floor(100000 + Math.random() * 900000).toString(),
      // No game, no target
    });
    return this.playerRepository.save(player);
  }


  async deletePlayer(gameId: number, id: number) {
    const player = await this.playerRepository.findOne({ where: { id, game: { id: gameId } } });
    if (!player) {
      throw new NotFoundException('Player not found');
    }
    return this.playerRepository.remove(player);
  }
  async deleteAllPlayers(gameId: number) {
       const players = await this.playerRepository.find({ where: { game: { id: gameId } }, select: ['id'] });
        if (players.length > 0) {
            const ids = players.map(p => p.id);
            await this.playerRepository.delete(ids);
        }
        return { message: 'All players deleted' };
  }
  async getAllPlayers(): Promise<Player[]> {
    return this.playerRepository.find({
    relations: ['game', 'currentTarget'],
  });
  }

  async getAlivePlayers(gameId: number): Promise<Player[]> {
    const game = await this.gameRepository.findOne({ where: { id: gameId } });
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    return this.playerRepository.find({
    where: { game: { id: gameId }, isAlive: true },
    relations: ['game', 'currentTarget'],
  });
  }

  async getLeaderboard(gameId: number): Promise<Player[]> {
    const game = await this.gameRepository.findOne({ where: { id: gameId } });
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    return this.playerRepository.find({
    where: { game: { id: gameId } },
    order: { kills: 'DESC' },
  });
  }
  async joinStandaloneGame(playerId: number, gameId: number) {
  // Check if game exists and is joinable
  const game = await this.gameRepository.findOne({ where: { id: gameId } });
  if (!game) throw new NotFoundException('Game not found');
  if (game.status !== GameStatus.WAITING)
    throw new BadRequestException('Cannot join a game that has started');

  // Check if player exists
  const player = await this.playerRepository.findOne({ 
    where: { id: playerId },
    relations: ['game']
  });
  if (!player) throw new NotFoundException('Player not found');

  // Check if player is already in a game
  if (player.game) {
    throw new BadRequestException('Player is already in a game');
  }

  // Check if nickname is unique in the target game
  const existingPlayer = await this.playerRepository.findOne({
    where: { game: { id: gameId }, nickname: player.nickname },
  });
  if (existingPlayer) {
    throw new BadRequestException('Nickname already taken in this game');
  }

  // Generate unique secret code for this game
  let code: string = '';
  let exists = true;
  
  while (exists) {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    const existingCode = await this.playerRepository.findOne({ 
      where: { game: { id: gameId }, secretCode: code } 
    });
    exists = !!existingCode;
  }

  // Assign player to game
  player.game = game;
  player.secretCode = code;
  player.isAlive = true;

  return this.playerRepository.save(player);
}





}


