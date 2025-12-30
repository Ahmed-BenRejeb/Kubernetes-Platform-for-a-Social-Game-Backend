import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from '../player/player.entity';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('GameGateway');
  private readonly PROXIMITY_THRESHOLD = 50; // meters

  // Map to track which socket belongs to which player
  private playerSockets: Map<number, string> = new Map();

  constructor(
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Remove from tracking
    const playerId = client.data.playerId;
    if (playerId) {
      this.playerSockets.delete(playerId);
    }
  }

  @SubscribeMessage('joinGame')
  handleJoinGame(
    @MessageBody() data: { gameId: number; playerId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `game-${data.gameId}`;
    client.join(roomName);
    client.data.playerId = data.playerId;
    client.data.gameId = data.gameId;
    
    // Track this player's socket
    this.playerSockets.set(data.playerId, client.id);
    
    this.logger.log(`Player ${data.playerId} joined ${roomName}`);
    
    client.to(roomName).emit('playerJoined', {
      playerId: data.playerId,
      timestamp: new Date(),
    });
    
    return { status: 'joined', room: roomName };
  }

  @SubscribeMessage('updateLocation')
  async handleLocationUpdate(
    @MessageBody() data: { playerId: number; latitude: number; longitude: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Update player location in database
      const player = await this.playerRepository.findOne({
        where: { id: data.playerId },
        relations: ['game', 'currentTarget'],
      });

      if (!player || !player.game) {
        return { status: 'error', message: 'Player not in game' };
      }

      player.latitude = data.latitude;
      player.longitude = data.longitude;
      player.lastLocationUpdate = new Date();
      await this.playerRepository.save(player);

      // Calculate distance to target
      let targetDistance;
      let targetNearby = false;

      if (player.currentTarget?.latitude && player.currentTarget?.longitude) {
        targetDistance = this.calculateDistance(
          data.latitude,
          data.longitude,
          player.currentTarget.latitude,
          player.currentTarget.longitude,
        );
        targetNearby = targetDistance <= this.PROXIMITY_THRESHOLD;
      }

      // Send distance update to THIS player only
      client.emit('distanceUpdate', {
        targetDistance: targetDistance ? Math.round(targetDistance) : null,
        targetNearby,
        timestamp: new Date(),
      });

      // Check if anyone hunting THIS player
     

      return { status: 'ok' };
    } catch (error) {
      this.logger.error('Error updating location:', error);
      return { status: 'error', message: error.message };
    }
  }

  // Haversine formula
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  // Methods for game events
  notifyKill(gameId: number, killerNickname: string, victimNickname: string, alivePlayers: number) {
    this.server.to(`game-${gameId}`).emit('playerKilled', {
      killer: killerNickname,
      victim: victimNickname,
      alivePlayers,
      timestamp: new Date(),
    });
  }

  notifyGameStarted(gameId: number) {
    this.server.to(`game-${gameId}`).emit('gameStarted', {
      gameId,
      timestamp: new Date(),
    });
  }

  notifyGameFinished(gameId: number, winnerNickname: string) {
    this.server.to(`game-${gameId}`).emit('gameFinished', {
      gameId,
      winner: winnerNickname,
      timestamp: new Date(),
    });
  }
}