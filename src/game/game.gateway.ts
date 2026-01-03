import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, forwardRef } from '@nestjs/common';
import { PlayerService } from '../player/player.service';
import { GameService } from './game.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private playerSocketMap = new Map<number, string>();
  constructor(
    @Inject(forwardRef(() => PlayerService))
    private playerService: PlayerService,
    @Inject(forwardRef(() => GameService))
    private gameService: GameService,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);

  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    for (const [playerId, socketId] of this.playerSocketMap.entries()) {
      if (socketId === client.id) {
        this.playerSocketMap.delete(playerId);
        break;
      }
    }
  }

  @SubscribeMessage('joinGame')
  handleJoinGame(
    @MessageBody() data: { gameId: number; playerId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `game-${data.gameId}`;
    client.join(roomName);
    this.playerSocketMap.set(data.playerId, client.id);
    console.log(`Player ${data.playerId} joined ${roomName}`);
    return { status: 'joined', room: roomName };
  }

  @SubscribeMessage('updateLocation')
  async handleLocationUpdate(
    @MessageBody() data: { playerId: number; latitude: number; longitude: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Pass data to Service (Redis logic)
      const result = await this.playerService.processLocationUpdate(
        data.playerId,
        data.latitude,
        data.longitude
      );

      // Send calculation back to the player
      client.emit('distanceUpdate', {
        targetNearby: result.targetNearby,
        targetDistance: result.distance,
      });
       if (result.targetNearby) {
        client.emit('targetAlert', {
          message: 'Your target is close!',
          distance: result.distance,
        });
      }

      return { status: 'ok' };
    } catch (error) {
      console.error(error);
      return { status: 'error' };
    }
  }
  notifyGameStarted(gameId: number, gameData: any) {
    const roomName = `game-${gameId}`;
    this.server.to(roomName).emit('gameStarted', {
      message: 'Game has started!',
      game: gameData,
    });
  }

  // Call this from GameService when a game finishes
  notifyGameFinished(gameId: number, winner: any) {
    const roomName = `game-${gameId}`;
    this.server.to(roomName).emit('gameFinished', {
      message: 'Game has finished!',
      winner: winner,
    });
  }


  @SubscribeMessage('requestKill')
  async handleKillRequest(
    @MessageBody() data: { hunterId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // 1. Verify Hunter is actually close (Security Check)
      const canKill = await this.playerService.verifyProximity(data.hunterId);
      
      if (!canKill.isNearby) {
        return { status: 'error', message: 'Target is too far away!' };
      }

      // 2. Find the Target's Socket ID
      const targetId = canKill.targetId;
      const targetSocketId = this.playerSocketMap.get(targetId);

      if (!targetSocketId) {
        return { status: 'error', message: 'Target is disconnected' };
      }

      // 3. Send the Popup to the Target
      this.server.to(targetSocketId).emit('killRequest', {
        hunterId: data.hunterId,
        message: 'Your hunter is close! Did they get you?',
      });

      return { status: 'waiting', message: 'Waiting for target confirmation...' };
    } catch (e) {
      console.error(e);
      return { status: 'error', message: e.message };
    }
  }

 @SubscribeMessage('respondToKill')
  async handleKillResponse(
    @MessageBody() data: { gameId: number; targetId: number; hunterId: number; accepted: boolean },
  ) {
    const hunterSocketId = this.playerSocketMap.get(data.hunterId);

    if (data.accepted) {
      try {
        // 1. Get the target using ID and GameID for safety
        const target = await this.playerService.getPlayerById( data.gameId,data.targetId);
        
        if (!target) throw new Error('Target not found in this game');

        // 2. Execute Kill
        // We pass 'target.secretCode' because your killTarget service expects (hunterId, targetCode)
        await this.playerService.killTarget(data.hunterId, target.secretCode);

        // 3. Notify Hunter
        if (hunterSocketId) {
          this.server.to(hunterSocketId).emit('killConfirmed', { result: 'success' });
        }



      } catch (error) {
        console.error('Kill Error:', error);
        if (hunterSocketId) {
          this.server.to(hunterSocketId).emit('killError', { message: error.message });
        }
      }
    } else {
      // Kill Denied
      if (hunterSocketId) {
        this.server.to(hunterSocketId).emit('killDenied', { 
            message: 'Target denied the kill. Get closer!' 
        });
      }
    }
  }




}