import bpy
import bmesh
import mathutils
from mathutils import Vector

# 既存のオブジェクトを削除
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# メッシュを作成
mesh = bpy.data.meshes.new("ProceduralMesh")
obj = bpy.data.objects.new("ProceduralObject", mesh)
bpy.context.collection.objects.link(obj)

# bmeshを使用してメッシュを生成
bm = bmesh.new()

# 格子状に頂点を作成
size = 5
spacing = 0.5
for i in range(size):
    for j in range(size):
        x = (i - size/2) * spacing
        y = (j - size/2) * spacing
        z = 0.5 * ((i - size/2)**2 + (j - size/2)**2) / (size/2)**2  # 放物面
        bm.verts.new((x, y, z))

# 面を作成
bm.verts.ensure_lookup_table()
for i in range(size-1):
    for j in range(size-1):
        v1 = bm.verts[i * size + j]
        v2 = bm.verts[i * size + j + 1]
        v3 = bm.verts[(i + 1) * size + j + 1]
        v4 = bm.verts[(i + 1) * size + j]
        bm.faces.new([v1, v2, v3, v4])

# メッシュを更新
bm.to_mesh(mesh)
bm.free()

# スムーズシェーディングを適用
bpy.context.view_layer.objects.active = obj
bpy.ops.object.shade_smooth()

# マテリアルを作成
material = bpy.data.materials.new(name="ProceduralMaterial")
material.use_nodes = True
nodes = material.node_tree.nodes
links = material.node_tree.links

# 既存のノードをクリア
for node in nodes:
    nodes.remove(node)

# 新しいノードを作成
output_node = nodes.new(type='ShaderNodeOutputMaterial')
principled_node = nodes.new(type='ShaderNodeBsdfPrincipled')
colormap_node = nodes.new(type='ShaderNodeColorRamp')
coord_node = nodes.new(type='ShaderNodeTexCoord')
separate_node = nodes.new(type='ShaderNodeSeparateXYZ')

# ノードを配置
coord_node.location = (-400, 0)
separate_node.location = (-200, 0)
colormap_node.location = (0, 0)
principled_node.location = (200, 0)
output_node.location = (400, 0)

# ノードを接続
links.new(coord_node.outputs['Generated'], separate_node.inputs['Vector'])
links.new(separate_node.outputs['Z'], colormap_node.inputs['Fac'])
links.new(colormap_node.outputs['Color'], principled_node.inputs['Base Color'])
links.new(principled_node.outputs['BSDF'], output_node.inputs['Surface'])

# カラーランプを設定
colormap_node.color_ramp.elements[0].color = (0.1, 0.2, 0.8, 1.0)  # 青
colormap_node.color_ramp.elements[1].color = (0.8, 0.2, 0.1, 1.0)  # 赤

obj.data.materials.append(material)

# カメラを追加
bpy.ops.object.camera_add(location=(5, -5, 4))
camera = bpy.context.active_object
camera.rotation_euler = (1.0, 0, 0.785)

# ライトを追加
bpy.ops.object.light_add(type='SUN', location=(4, 4, 6))
light = bpy.context.active_object
light.data.energy = 3

print("プロシージャルメッシュが作成されました!")