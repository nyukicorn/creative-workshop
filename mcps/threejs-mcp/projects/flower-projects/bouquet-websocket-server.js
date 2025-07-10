const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8083 });

console.log('🌹💐 妖精会社 Bouquet WebSocket Server started on port 8083');

wss.on('connection', function(ws) {
    console.log('Bouquet client connected');
    
    ws.on('message', function(message) {
        try {
            const data = JSON.parse(message);
            console.log('Received bouquet message:', JSON.stringify(data, null, 2));
            
            // Only echo back command messages (those with 'action' field)
            if (data.action) {
                console.log('Broadcasting bouquet command:', data.action, 'to', wss.clients.size, 'clients');
                wss.clients.forEach(function(client) {
                    if (client.readyState === WebSocket.OPEN) {
                        console.log('Sending to bouquet client:', client === ws ? 'sender' : 'other');
                        client.send(message);
                    }
                });
            } else {
                console.log('Ignoring bouquet state message from client (no action field)');
            }
        } catch (error) {
            console.error('Error parsing bouquet message:', error);
        }
    });
    
    ws.on('close', function() {
        console.log('Bouquet client disconnected');
    });
});