import bpy

# カメラを追加
bpy.ops.object.camera_add(location=(7, -7, 5))
camera = bpy.context.active_object
camera.rotation_euler = (1.1, 0, 0.785)

# カメラをアクティブに設定
bpy.context.scene.camera = camera

# シーンを保存
bpy.ops.wm.save_as_mainfile(filepath="test_scene.blend")

print("カメラが修正されました!")