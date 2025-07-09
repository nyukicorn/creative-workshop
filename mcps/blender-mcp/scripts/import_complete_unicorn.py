import bpy
import os

# 既存のオブジェクトを削除
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# 作業ディレクトリを設定
work_dir = "/Users/nukuiyuki/Dev/mcp-tools/Blender/unicorn1_complete"

print(f"作業ディレクトリ: {work_dir}")
print(f"ディレクトリの存在確認: {os.path.exists(work_dir)}")

# FBXファイルのパス
fbx_path = os.path.join(work_dir, "fbx", "unicorn-walk.fbx")
texture_path = os.path.join(work_dir, "fbx", "texture_unicorn.png")

print(f"FBXファイル: {fbx_path}")
print(f"FBXファイル存在: {os.path.exists(fbx_path)}")
print(f"テクスチャファイル: {texture_path}")
print(f"テクスチャファイル存在: {os.path.exists(texture_path)}")

# FBXファイルをインポート
try:
    bpy.ops.import_scene.fbx(filepath=fbx_path)
    print("FBXインポート成功!")
except Exception as e:
    print(f"FBXインポートエラー: {e}")

# インポートされたオブジェクトを確認
imported_objects = [obj for obj in bpy.context.selected_objects]
print(f"インポートされたオブジェクト数: {len(imported_objects)}")

# テクスチャを手動で読み込み
try:
    texture_img = bpy.data.images.load(texture_path)
    print(f"テクスチャ読み込み成功: {texture_img.name}")
    print(f"テクスチャサイズ: {texture_img.size[:]}")
except Exception as e:
    print(f"テクスチャ読み込みエラー: {e}")

# メインのユニコーンオブジェクトを見つけて、テクスチャを適用
unicorn_obj = None
for obj in bpy.data.objects:
    if obj.type == 'MESH' and 'model' in obj.name.lower():
        unicorn_obj = obj
        break

if unicorn_obj:
    print(f"ユニコーンオブジェクト発見: {unicorn_obj.name}")
    
    # マテリアルを確認・修正
    for i, mat_slot in enumerate(unicorn_obj.material_slots):
        if mat_slot.material:
            mat = mat_slot.material
            print(f"マテリアル {i}: {mat.name}")
            
            # ノードツリーの設定
            if mat.use_nodes and mat.node_tree:
                nodes = mat.node_tree.nodes
                links = mat.node_tree.links
                
                # Principled BSDFノードを探す
                principled_node = None
                for node in nodes:
                    if node.type == 'BSDF_PRINCIPLED':
                        principled_node = node
                        break
                
                if principled_node and 'texture_img' in locals():
                    # Image Textureノードを追加
                    tex_node = nodes.new(type='ShaderNodeTexImage')
                    tex_node.image = texture_img
                    tex_node.location = (-300, 0)
                    
                    # テクスチャをBase Colorに接続
                    links.new(tex_node.outputs['Color'], principled_node.inputs['Base Color'])
                    
                    print(f"  - テクスチャを{mat.name}に適用しました")
else:
    print("ユニコーンオブジェクトが見つかりません")

# すべてのマテリアルを確認
print("\n=== 全マテリアル情報 ===")
for mat in bpy.data.materials:
    print(f"マテリアル: {mat.name}")
    if mat.use_nodes:
        for node in mat.node_tree.nodes:
            if node.type == 'TEX_IMAGE':
                print(f"  - Image Textureノード: {node.image.name if node.image else 'None'}")

# カメラを追加
bpy.ops.object.camera_add(location=(7, -7, 5))
camera = bpy.context.active_object
camera.rotation_euler = (1.1, 0, 0.785)

# ライトを追加
bpy.ops.object.light_add(type='SUN', location=(4, 4, 6))
light = bpy.context.active_object
light.data.energy = 3

# シーンを保存
bpy.ops.wm.save_as_mainfile(filepath="complete_unicorn_scene.blend")

print("完全なユニコーンシーンを保存しました: complete_unicorn_scene.blend")