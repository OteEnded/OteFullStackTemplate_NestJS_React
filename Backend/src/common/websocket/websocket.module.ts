import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

/**
 * Exposes the WebSocket gateway. Inject EventsGateway elsewhere to push
 * messages (e.g. eventsGateway.sendToUser(id, payload)).
 */
@Module({
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class WebsocketModule {}
