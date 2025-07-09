from PIL import Image
import numpy as np

# 画像を読み込み
img = Image.open('petal_rose_pink.png').convert('RGBA')
data = np.array(img)

# 透明でない部分のみ処理
non_transparent = data[:, :, 3] > 0

# HSVに変換してピンクを赤に変更
from PIL import ImageColor
import colorsys

# ピクセルごとに処理
for i in range(data.shape[0]):
    for j in range(data.shape[1]):
        if non_transparent[i, j]:
            r, g, b, a = data[i, j]
            
            # RGBをHSVに変換
            h, s, v = colorsys.rgb_to_hsv(r/255.0, g/255.0, b/255.0)
            
            # ピンク系の色相（300-360度、0-60度）を赤系（0-20度）に変更
            if h > 0.83 or h < 0.17:  # ピンク〜赤の範囲
                # 赤系の色相に変更（0-20度の範囲）
                h = h * 0.06 if h < 0.5 else (h - 0.83) * 0.24
                
                # 彩度を少し上げて鮮やかな赤に
                s = min(1.0, s * 1.2)
                
                # 明度を少し下げて深い赤に
                v = v * 0.9
                
                # HSVをRGBに戻す
                r_new, g_new, b_new = colorsys.hsv_to_rgb(h, s, v)
                data[i, j] = [int(r_new * 255), int(g_new * 255), int(b_new * 255), a]

# 結果を保存
result = Image.fromarray(data, 'RGBA')
result.save('petal_rose_red.png')
print('ピンクの花びらを赤に変更しました: petal_rose_red.png')