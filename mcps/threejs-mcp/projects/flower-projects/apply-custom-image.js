const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

function applyCustomImage(imagePath) {
    // ファイルの存在確認
    if (!fs.existsSync(imagePath)) {
        console.error(`❌ ファイルが見つかりません: ${imagePath}`);
        return;
    }
    
    const ws = new WebSocket('ws://localhost:8082');
    
    ws.on('open', function() {
        console.log('🖼️ カスタム画像適用ツール');
        console.log('============================');
        console.log(`📁 画像パス: ${imagePath}`);
        console.log(`📄 ファイル名: ${path.basename(imagePath)}`);
        console.log('');
        
        const command = {
            action: "setBackgroundImage",
            imagePath: `file://${path.resolve(imagePath)}`
        };
        
        ws.send(JSON.stringify(command));
        console.log('🚀 画像を3D庭園の地面に適用中...');
        console.log('✅ 完了！ブラウザで確認してください 🌸');
        
        setTimeout(() => {
            ws.close();
        }, 1000);
    });
    
    ws.on('error', function(error) {
        console.error('❌ WebSocket接続エラー:', error.message);
        console.log('💡 WebSocketサーバーが起動しているか確認してください');
    });
}

// コマンドライン引数から画像パスを取得
if (process.argv[2]) {
    const imagePath = process.argv[2];
    applyCustomImage(imagePath);
} else {
    console.log('🖼️ カスタム画像適用ツール');
    console.log('============================');
    console.log('使用方法:');
    console.log('node apply-custom-image.js "画像のフルパス"');
    console.log('');
    console.log('例:');
    console.log('node apply-custom-image.js "/Users/nukuiyuki/Dev/20250219_画像＋three.js/kamui-creative-2025-02-19T17-31-44"');
}

module.exports = { applyCustomImage };