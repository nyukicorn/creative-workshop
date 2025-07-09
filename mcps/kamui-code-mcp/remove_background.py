from PIL import Image
import numpy as np

# 画像を読み込み
img = Image.open('imagen_imagen-3.0-generate-002_20250705_022132_0.png').convert('RGBA')
data = np.array(img)

# より柔軟な背景除去
# 白っぽい色（RGB値がすべて250以上）を透明にする
white_mask = (data[:, :, 0] >= 250) & (data[:, :, 1] >= 250) & (data[:, :, 2] >= 250)

# さらに、彩度の低い（グレーっぽい）色も透明にする
gray_mask = (np.abs(data[:, :, 0] - data[:, :, 1]) < 10) & (np.abs(data[:, :, 1] - data[:, :, 2]) < 10) & (data[:, :, 0] > 200)

# 両方の条件を満たす部分を透明にする
bg_mask = white_mask | gray_mask
data[bg_mask] = [0, 0, 0, 0]  # 透明にする

# 結果を保存
result = Image.fromarray(data, 'RGBA')
result.save('rose_petal_fully_transparent.png')
print('背景を完全に透明化しました: rose_petal_fully_transparent.png')

# 透明化された部分の割合を計算
transparent_pixels = np.sum(bg_mask)
total_pixels = data.shape[0] * data.shape[1]
print(f'透明化された部分: {transparent_pixels}/{total_pixels} ({transparent_pixels/total_pixels*100:.1f}%)')