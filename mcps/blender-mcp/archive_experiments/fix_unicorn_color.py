import bpy
import os

# 既存のオブジェクトを削除
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# オリジナルのGLBファイルをインポート（テクスチャ付き）
bpy.ops.import_scene.gltf(filepath='imported_models/unicorn-walk.glb')

print("オリジナルのユニコーンをインポートしました")

# インポートされたオブジェクトを確認
imported_objects = [obj for obj in bpy.context.selected_objects]
for obj in imported_objects:
    print(f"オブジェクト: {obj.name}, タイプ: {obj.type}")
    if obj.type == 'MESH':
        print(f"  - マテリアル数: {len(obj.data.materials)}")
        for i, mat in enumerate(obj.data.materials):
            if mat:
                print(f"    マテリアル {i}: {mat.name}")

# メインのユニコーンオブジェクトを見つける
unicorn_obj = None
for obj in bpy.data.objects:
    if obj.type == 'MESH' and obj.name == 'model':
        unicorn_obj = obj
        break

if unicorn_obj:
    print(f"ユニコーンオブジェクト発見: {unicorn_obj.name}")
    
    # オブジェクトをアクティブにする
    bpy.context.view_layer.objects.active = unicorn_obj
    bpy.ops.object.select_all(action='DESELECT')
    unicorn_obj.select_set(True)
    
    # 既存のマテリアルを確認・修正
    for i, mat_slot in enumerate(unicorn_obj.material_slots):
        if mat_slot.material:
            mat = mat_slot.material
            print(f"マテリアル {i}: {mat.name} を確認中...")
            
            # ノードツリーがあるか確認
            if mat.use_nodes and mat.node_tree:
                nodes = mat.node_tree.nodes
                
                # Principled BSDFノードを探す
                principled_node = None
                for node in nodes:
                    if node.type == 'BSDF_PRINCIPLED':
                        principled_node = node
                        break
                
                if principled_node:
                    # 既存のピンク色を削除して、元の設定に戻す
                    print(f"  - Principled BSDFノード発見、色をリセット")
                    
                    # デフォルトの白色に戻す（テクスチャが正しく表示されるように）
                    principled_node.inputs['Base Color'].default_value = (1.0, 1.0, 1.0, 1.0)
                    principled_node.inputs['Metallic'].default_value = 0.0
                    principled_node.inputs['Roughness'].default_value = 0.5
                    
                    print(f"  - 色をリセットしました")
                else:
                    print(f"  - Principled BSDFノードが見つかりませんでした")
            else:
                print(f"  - ノードツリーがありません")

    # 150%に拡大（前回の変更を保持）
    unicorn_obj.scale = (1.5, 1.5, 1.5)
    
    # 位置を少し上に移動
    unicorn_obj.location.z += 0.5
    
    print("ユニコーンの色を修正し、サイズ調整しました")
else:
    print("ユニコーンオブジェクトが見つかりません")

# カメラを追加
bpy.ops.object.camera_add(location=(7, -7, 5))
camera = bpy.context.active_object
camera.rotation_euler = (1.1, 0, 0.785)

# ライトを追加
bpy.ops.object.light_add(type='SUN', location=(4, 4, 6))
light = bpy.context.active_object
light.data.energy = 3

# シーンを保存
bpy.ops.wm.save_as_mainfile(filepath="fixed_unicorn_scene.blend")

print("色を修正したユニコーンシーンを保存しました: fixed_unicorn_scene.blend")