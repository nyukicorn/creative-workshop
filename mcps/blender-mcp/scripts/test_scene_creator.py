import bpy

# 既存のオブジェクトを削除
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# キューブを作成
bpy.ops.mesh.primitive_cube_add(location=(0, 0, 0))
cube = bpy.context.active_object
cube.name = "TestCube"

# マテリアルを作成
material = bpy.data.materials.new(name="TestMaterial")
material.use_nodes = True
# Principled BSDFノードを探す
for node in material.node_tree.nodes:
    if node.type == 'BSDF_PRINCIPLED':
        node.inputs[0].default_value = (0.8, 0.2, 0.2, 1.0)
        break
cube.data.materials.append(material)

# カメラを追加
bpy.ops.object.camera_add(location=(7, -7, 5))
camera = bpy.context.active_object
camera.rotation_euler = (1.1, 0, 0.785)

# ライトを追加
bpy.ops.object.light_add(type='SUN', location=(4, 4, 6))
light = bpy.context.active_object
light.data.energy = 3

# シーンを保存
bpy.ops.wm.save_as_mainfile(filepath="test_scene.blend")

print("テストシーンが作成され、保存されました!")