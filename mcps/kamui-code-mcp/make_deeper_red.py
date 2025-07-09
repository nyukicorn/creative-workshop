from PIL import Image
import numpy as np
import colorsys

# 画像を読み込み
img = Image.open('petal_rose_pink.png').convert('RGBA')
data = np.array(img)

# 透明でない部分のみ処理
non_transparent = data[:, :, 3] > 0

# ピクセルごとに処理
for i in range(data.shape[0]):
    for j in range(data.shape[1]):
        if non_transparent[i, j]:
            r, g, b, a = data[i, j]
            
            # RGBをHSVに変換
            h, s, v = colorsys.rgb_to_hsv(r/255.0, g/255.0, b/255.0)
            
            # ピンク系の色相を深い赤に変更
            if h > 0.83 or h < 0.17:  # ピンク〜赤の範囲
                # 深い赤の色相に設定（0-10度の範囲）
                h = 0.02  # 深い赤の色相
                
                # 彩度を大幅に上げて鮮やかに
                s = min(1.0, s * 1.5)
                
                # 明度を大幅に下げて深い赤に
                v = v * 0.6  # より暗く
                
                # HSVをRGBに戻す
                r_new, g_new, b_new = colorsys.hsv_to_rgb(h, s, v)
                data[i, j] = [int(r_new * 255), int(g_new * 255), int(b_new * 255), a]

# 結果を保存
result = Image.fromarray(data, 'RGBA')
result.save('petal_rose_deep_red.png')
print('ピンクの花びらを深い赤に変更しました: petal_rose_deep_red.png')