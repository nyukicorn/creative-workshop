import bpy
import bmesh

# 既存のオブジェクトを削除
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# キューブを作成
bpy.ops.mesh.primitive_cube_add(location=(0, 0, 0))
cube = bpy.context.active_object
cube.name = "AnimatedCube"

# アニメーションを設定
frame_start = 1
frame_end = 120

# 回転アニメーション
cube.rotation_euler = (0, 0, 0)
cube.keyframe_insert(data_path="rotation_euler", frame=frame_start)

cube.rotation_euler = (0, 0, 6.28)  # 2π = 360度
cube.keyframe_insert(data_path="rotation_euler", frame=frame_end)

# 移動アニメーション
cube.location = (0, 0, 0)
cube.keyframe_insert(data_path="location", frame=frame_start)

cube.location = (0, 0, 3)
cube.keyframe_insert(data_path="location", frame=frame_end//2)

cube.location = (0, 0, 0)
cube.keyframe_insert(data_path="location", frame=frame_end)

# フレーム範囲を設定
bpy.context.scene.frame_start = frame_start
bpy.context.scene.frame_end = frame_end

# カメラを追加
bpy.ops.object.camera_add(location=(7, -7, 5))
camera = bpy.context.active_object
camera.rotation_euler = (1.1, 0, 0.785)

# ライトを追加
bpy.ops.object.light_add(type='SUN', location=(4, 4, 6))
light = bpy.context.active_object
light.data.energy = 3

print("アニメーションシーンが作成されました!")