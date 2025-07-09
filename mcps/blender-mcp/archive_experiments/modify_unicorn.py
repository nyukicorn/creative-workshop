import bpy
import bmesh
from mathutils import Vector

# ユニコーンシーンをロード
# bpy.ops.wm.open_mainfile(filepath="unicorn_scene.blend")

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
    
    # 1. スケール変更（150%に拡大）
    unicorn_obj.scale = (1.5, 1.5, 1.5)
    
    # 2. 位置を少し上に移動
    unicorn_obj.location.z += 0.5
    
    # 3. 新しいマテリアルを作成（虹色効果）
    rainbow_material = bpy.data.materials.new(name="RainbowUnicorn")
    rainbow_material.use_nodes = True
    nodes = rainbow_material.node_tree.nodes
    links = rainbow_material.node_tree.links
    
    # 既存のノードをクリア
    for node in nodes:
        nodes.remove(node)
    
    # 新しいノードを作成
    output_node = nodes.new(type='ShaderNodeOutputMaterial')
    principled_node = nodes.new(type='ShaderNodeBsdfPrincipled')
    
    # ノードを配置
    principled_node.location = (0, 0)
    output_node.location = (200, 0)
    
    # ノードを接続
    links.new(principled_node.outputs['BSDF'], output_node.inputs['Surface'])
    
    # 虹色に設定（シンプルに）
    principled_node.inputs['Base Color'].default_value = (1.0, 0.0, 0.8, 1.0)  # マゼンタ
    principled_node.inputs['Metallic'].default_value = 0.8
    principled_node.inputs['Roughness'].default_value = 0.2
    
    # マテリアルを追加（既存のマテリアルは保持）
    if len(unicorn_obj.data.materials) > 0:
        unicorn_obj.data.materials[0] = rainbow_material
    else:
        unicorn_obj.data.materials.append(rainbow_material)
    
    print("ユニコーンを変更しました:")
    print("- 150%に拡大")
    print("- 位置を上に移動")
    print("- 虹色マテリアルを追加")
    
    # 4. パーティクルシステムを追加（魔法の粒子効果）
    bpy.ops.object.particle_system_add()
    particle_system = unicorn_obj.particle_systems[-1]
    settings = particle_system.settings
    
    # パーティクル設定
    settings.type = 'EMITTER'
    settings.count = 1000
    settings.lifetime = 50
    settings.lifetime_random = 0.5
    settings.emit_from = 'VOLUME'
    settings.physics_type = 'NEWTON'
    settings.mass = 0.1
    settings.particle_size = 0.02
    settings.size_random = 0.5
    
    # 重力を軽くして浮遊効果
    settings.effector_weights.gravity = -0.1
    
    print("- 魔法のパーティクル効果を追加")
else:
    print("ユニコーンオブジェクトが見つかりません")

# シーンを保存
bpy.ops.wm.save_as_mainfile(filepath="modified_unicorn_scene.blend")

print("変更されたユニコーンシーンを保存しました: modified_unicorn_scene.blend")