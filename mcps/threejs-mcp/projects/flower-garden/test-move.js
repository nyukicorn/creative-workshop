const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8082');

ws.on('open', function() {
    console.log('Connected to Three.js MCP server');
    
    // ajisai_sphere（薄紫の球体）を上に移動
    const moveCommand = {
        action: "moveObject",
        id: "ajisai_sphere",
        position: [2, 3, 0]  // Y座標を1から3に変更
    };
    
    setTimeout(() => {
        ws.send(JSON.stringify(moveCommand));
        console.log('Moved ajisai_sphere up!');
        
        setTimeout(() => {
            ws.close();
        }, 1000);
    }, 500);
});

ws.on('error', function(error) {
    console.error('WebSocket error:', error);
});