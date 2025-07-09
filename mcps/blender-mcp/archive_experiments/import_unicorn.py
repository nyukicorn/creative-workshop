import bpy

# 既存のオブジェクトを削除
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# GLBファイルをインポート
bpy.ops.import_scene.gltf(filepath='imported_models/unicorn-walk.glb')

# インポートされたオブジェクトを確認
imported_objects = [obj for obj in bpy.context.selected_objects]
print(f"インポートされたオブジェクト数: {len(imported_objects)}")

for obj in imported_objects:
    print(f"オブジェクト: {obj.name}, タイプ: {obj.type}")
    if obj.type == 'MESH':
        print(f"  - 頂点数: {len(obj.data.vertices)}")
        print(f"  - 面数: {len(obj.data.polygons)}")
        print(f"  - マテリアル数: {len(obj.data.materials)}")

# アニメーションがある場合の情報
if bpy.data.actions:
    print(f"アニメーション数: {len(bpy.data.actions)}")
    for action in bpy.data.actions:
        print(f"  - アニメーション名: {action.name}")
        print(f"  - フレーム範囲: {action.frame_range}")

# カメラを追加（より良い視点で）
bpy.ops.object.camera_add(location=(5, -5, 3))
camera = bpy.context.active_object
camera.rotation_euler = (1.1, 0, 0.785)

# ライトを追加
bpy.ops.object.light_add(type='SUN', location=(4, 4, 6))
light = bpy.context.active_object
light.data.energy = 3

# シーンを保存
bpy.ops.wm.save_as_mainfile(filepath="unicorn_scene.blend")

print("ユニコーンシーンがインポートされ、保存されました!")