import { Elysia } from 'elysia';

export const wsRoutes = new Elysia()
  .ws('/ws', {
    message(ws, message) {
      // Echo for now - workers will broadcast leaderboard updates
      ws.send({ type: 'ack', data: message });
    },
    open(ws) {
      console.log('WebSocket client connected');
    },
    close(ws) {
      console.log('WebSocket client disconnected');
    },
  });
