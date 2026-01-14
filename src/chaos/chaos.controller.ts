import { Controller, Get, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from 'src/player/player.entity';
import { Repository } from 'typeorm';


@Controller('chaos')
export class ChaosController {
  constructor(
    @InjectRepository(Player)
    private readonly usersRepository: Repository<Player>,
  ) {}

  @Get('db-stress')
  async dbStress() {
    return this.usersRepository.find({
    take: 5000,
      order: { id: 'DESC' },
    });
  }
}
