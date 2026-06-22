import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/**
 * WebSocket scaffold (parity with the Fastify template's websocket plugin).
 *
 * Tracks connections per user id (read from the `userId` handshake query) and
 * exposes sendToUser(), mirroring the Fastify ws helper. Uses socket.io.
 *
 * CORS for the socket handshake is set here; tighten `origin` for production.
 */
@WebSocketGateway({
  cors: { origin: true },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(EventsGateway.name);
  private readonly connections = new Map<string, Set<Socket>>();

  @WebSocketServer()
  server!: Server;

  handleConnection(socket: Socket) {
    const userId = String(socket.handshake.query.userId ?? 'anonymous');
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId)!.add(socket);
    this.logger.log(`Socket connected (userId=${userId}, id=${socket.id})`);
  }

  handleDisconnect(socket: Socket) {
    for (const [userId, sockets] of this.connections) {
      if (sockets.delete(socket) && sockets.size === 0) {
        this.connections.delete(userId);
      }
    }
  }

  /** Push a payload to every active socket for a given user id. */
  sendToUser(userId: string, payload: unknown): void {
    const sockets = this.connections.get(userId);
    if (!sockets) return;
    for (const socket of sockets) {
      socket.emit('message', payload);
    }
  }
}
