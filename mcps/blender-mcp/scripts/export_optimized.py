import bpy

# すべてのオブジェクトを選択
bpy.ops.object.select_all(action='SELECT')

# 最適化されたglTF形式でエクスポート
bpy.ops.export_scene.gltf(
    filepath='test_scene_optimized.glb',
    export_format='GLB',  # GLBは単一ファイル形式
    use_selection=False,
    
    # ジオメトリ設定
    export_apply=True,  # モディファイアを適用
    export_yup=True,  # Y-up座標系（標準）
    
    # マテリアル・テクスチャ設定
    export_materials='EXPORT',
    export_images=True,
    export_jpeg_quality=75,  # JPEG品質（軽量化）
    
    # アニメーション設定
    export_animations=True,
    export_frame_range=True,
    export_force_sampling=True,
    export_nla_strips=True,
    
    # ライティング・カメラ
    export_cameras=True,
    export_lights=True,
    
    # 圧縮設定（重要！）
    export_draco_mesh_compression_enable=True,  # Draco圧縮
    export_draco_mesh_compression_level=6,  # 圧縮レベル（0-10）
    export_draco_position_quantization=14,  # 位置量子化
    export_draco_normal_quantization=10,  # 法線量子化
    export_draco_texcoord_quantization=12,  # UV量子化
    
    # 最適化設定
    export_optimize_animation_size=True,
    export_extras=False,  # 余分なデータを除外
    export_vertex_color='MATERIAL',  # 頂点色設定
    
    # デバッグ用
    export_copyright=''
)

print("最適化されたglTF/GLBエクスポートが完了しました: test_scene_optimized.glb")