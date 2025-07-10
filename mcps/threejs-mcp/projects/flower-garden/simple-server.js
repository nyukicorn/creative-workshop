import WebSocket, { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8082 });

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.on('message', (message) => {
    console.log('Received:', message.toString());
  });
});

console.log('WebSocket server running on port 8082');