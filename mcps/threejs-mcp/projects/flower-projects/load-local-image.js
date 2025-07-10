const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const ws = new WebSocket('ws://localhost:8082');

// macOSの一般的な画像保存場所
const commonImagePaths = [
    '/Users/nukuiyuki/Desktop',
    '/Users/nukuiyuki/Downloads', 
    '/Users/nukuiyuki/Pictures',
    '/Users/nukuiyuki/Documents',
    '/Users/nukuiyuki/Pictures/Photos Library.photoslibrary',
    '/System/Library/Desktop Pictures' // macOSのデフォルト壁紙
];

function findImageFiles(directory) {
    try {
        if (!fs.existsSync(directory)) return [];
        
        const files = fs.readdirSync(directory);
        return files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext);
        }).map(file => path.join(directory, file));
    } catch (error) {
        return [];
    }
}

ws.on('open', function() {
    console.log('🖼️ ローカル画像検索ツール');
    console.log('=====================================');
    console.log('');
    
    // 各フォルダで画像を検索
    console.log('📂 利用可能な画像ファイルを検索中...');
    console.log('');
    
    let allImages = [];
    
    commonImagePaths.forEach(folder => {
        const images = findImageFiles(folder);
        if (images.length > 0) {
            console.log(`📁 ${folder}:`);
            images.slice(0, 5).forEach((imagePath, index) => { // 最初の5個だけ表示
                console.log(`   ${index + 1}. ${path.basename(imagePath)}`);
                allImages.push(imagePath);
            });
            if (images.length > 5) {
                console.log(`   ... 他 ${images.length - 5} 個`);
            }
            console.log('');
        }
    });
    
    if (allImages.length === 0) {
        console.log('❌ 画像ファイルが見つかりませんでした');
        console.log('');
        console.log('💡 手動で画像パスを指定する方法:');
        console.log('node load-local-image.js "/path/to/your/image.jpg"');
        ws.close();
        return;
    }
    
    // デスクトップの最初の画像を自動選択（テスト用）
    const desktopImages = findImageFiles('/Users/nukuiyuki/Desktop');
    const downloadsImages = findImageFiles('/Users/nukuiyuki/Downloads');
    const picturesImages = findImageFiles('/Users/nukuiyuki/Pictures');
    
    let selectedImage = null;
    
    if (desktopImages.length > 0) {
        selectedImage = desktopImages[0];
        console.log(`🎯 デスクトップから自動選択: ${path.basename(selectedImage)}`);
    } else if (downloadsImages.length > 0) {
        selectedImage = downloadsImages[0];
        console.log(`🎯 ダウンロードフォルダから自動選択: ${path.basename(selectedImage)}`);
    } else if (picturesImages.length > 0) {
        selectedImage = picturesImages[0];
        console.log(`🎯 ピクチャーフォルダから自動選択: ${path.basename(selectedImage)}`);
    } else {
        selectedImage = allImages[0];
        console.log(`🎯 最初に見つかった画像を自動選択: ${path.basename(selectedImage)}`);
    }
    
    console.log('');
    console.log('🚀 画像を3D庭園の地面に適用中...');
    
    setTimeout(() => {
        const setBackgroundCommand = {
            action: "setBackgroundImage",
            imagePath: `file://${selectedImage}`
        };
        
        ws.send(JSON.stringify(setBackgroundCommand));
        console.log(`✅ 画像を設定しました: ${selectedImage}`);
        console.log('');
        console.log('🌸 ブラウザで花の庭園の地面を確認してください！');
        console.log('💡 異なる画像を使いたい場合は:');
        console.log(`   node load-local-image.js "${selectedImage}"`);
        
        setTimeout(() => {
            ws.close();
        }, 2000);
    }, 1000);
});

ws.on('error', function(error) {
    console.error('WebSocket error:', error);
});

// コマンドライン引数から直接画像パスを指定
if (process.argv[2]) {
    const customImagePath = process.argv[2];
    
    if (!fs.existsSync(customImagePath)) {
        console.error(`❌ ファイルが見つかりません: ${customImagePath}`);
        process.exit(1);
    }
    
    const wsCustom = new WebSocket('ws://localhost:8082');
    wsCustom.on('open', function() {
        console.log(`🖼️ 指定された画像を適用: ${path.basename(customImagePath)}`);
        
        const command = {
            action: "setBackgroundImage",
            imagePath: `file://${path.resolve(customImagePath)}`
        };
        wsCustom.send(JSON.stringify(command));
        console.log(`✅ 画像を設定しました: ${customImagePath}`);
        wsCustom.close();
    });
}