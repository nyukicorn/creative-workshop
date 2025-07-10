const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8082');

ws.on('open', function() {
    console.log('🖼️ 背景画像設定ツールに接続しました');
    console.log('');
    console.log('使用方法:');
    console.log('1. 画像ファイルをプロジェクトディレクトリに配置');
    console.log('2. このスクリプトを実行して画像パスを指定');
    console.log('3. ブラウザで地面に画像が適用されるのを確認');
    console.log('');
    
    // サンプル画像パスの例
    const sampleImagePaths = [
        './sample-garden.jpg',        // 庭園の写真
        './flower-field.png',         // 花畑の画像
        './grass-texture.jpg',        // 草のテクスチャ
        'https://picsum.photos/512/512?random=1', // ランダム画像（テスト用）
    ];
    
    console.log('サンプル画像パスの例:');
    sampleImagePaths.forEach((path, index) => {
        console.log(`${index + 1}. ${path}`);
    });
    console.log('');
    
    // テスト用にランダム画像を設定
    setTimeout(() => {
        const testImagePath = 'https://picsum.photos/512/512?random=garden';
        
        const setBackgroundCommand = {
            action: "setBackgroundImage",
            imagePath: testImagePath
        };
        
        ws.send(JSON.stringify(setBackgroundCommand));
        console.log(`🎨 テスト画像を設定しました: ${testImagePath}`);
        console.log('ブラウザで地面のテクスチャが変わったか確認してください！');
        
        setTimeout(() => {
            ws.close();
        }, 2000);
    }, 1000);
});

ws.on('error', function(error) {
    console.error('WebSocket error:', error);
});

// 任意の画像を設定するためのヘルパー関数をエクスポート
function setCustomImage(imagePath) {
    const ws = new WebSocket('ws://localhost:8082');
    
    ws.on('open', function() {
        const command = {
            action: "setBackgroundImage", 
            imagePath: imagePath
        };
        ws.send(JSON.stringify(command));
        console.log(`カスタム画像を設定: ${imagePath}`);
        ws.close();
    });
}

// コマンドライン引数から画像パスを取得
if (process.argv[2]) {
    const customImagePath = process.argv[2];
    console.log(`コマンドライン引数から画像パス取得: ${customImagePath}`);
    
    const ws = new WebSocket('ws://localhost:8082');
    ws.on('open', function() {
        const command = {
            action: "setBackgroundImage",
            imagePath: customImagePath
        };
        ws.send(JSON.stringify(command));
        console.log(`✅ 画像を設定しました: ${customImagePath}`);
        ws.close();
    });
}