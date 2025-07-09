import bpy

# すべてのオブジェクトを選択
bpy.ops.object.select_all(action='SELECT')

# glTF形式でエクスポート
bpy.ops.export_scene.gltf(
    filepath='test_scene.glb',
    export_format='GLB',
    use_selection=False,
    export_materials='EXPORT',
    export_cameras=True,
    export_lights=True,
    export_apply=True
)

print("glTF/GLBエクスポートが完了しました: test_scene.glb")