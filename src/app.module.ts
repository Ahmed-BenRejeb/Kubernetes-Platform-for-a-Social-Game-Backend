import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common'; // <--- Added imports
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './game/game.entity';
import { GameModule } from './game/game.module';
import { Player } from './player/player.entity';
import { PlayerModule } from './player/player.module';
import { RedisModule } from './redis/redis.module';
import { ChaosModule } from './chaos/chaos.module';
import { AppLoggerMiddleware } from './logger-middleware'; // <--- Import the new file

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),    
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        entities: [Game,Player],
        synchronize: true,
      }), 
    }),
    GameModule,
    PlayerModule,
    RedisModule,
    ChaosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
// Updated class definition below:
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AppLoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}