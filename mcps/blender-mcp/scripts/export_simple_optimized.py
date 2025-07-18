import bpy

# すべてのオブジェクトを選択
bpy.ops.object.select_all(action='SELECT')

# シンプルで最適化されたglTF形式でエクスポート
bpy.ops.export_scene.gltf(
    filepath='test_scene_optimized.glb',
    export_format='GLB',
    use_selection=False,
    
    # 基本設定
    export_apply=True,
    export_yup=True,
    
    # マテリアル・テクスチャ
    export_materials='EXPORT',
    
    # アニメーション・カメラ・ライト
    export_animations=True,
    export_cameras=True,
    export_lights=True,
    
    # 圧縮設定（最重要）
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
    export_draco_position_quantization=14,
    export_draco_normal_quantization=10,
    export_draco_texcoord_quantization=12
)

print("最適化されたglTF/GLBエクスポートが完了しました: test_scene_optimized.glb")