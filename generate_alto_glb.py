import io, json, struct, os, sys
import numpy as np
from PIL import Image, ImageFilter

try:
    from scipy.ndimage import distance_transform_edt, binary_erosion
    HAVE_SCIPY = True
except ImportError:
    HAVE_SCIPY = False

def pad_foreground(rgb, mask):
    """Extrapolates foreground colors into background so UV edges have zero dark seams."""
    if HAVE_SCIPY:
        eroded = binary_erosion(mask, iterations=2)
        _, indices = distance_transform_edt(~eroded, return_indices=True)
        return rgb[indices[0], indices[1]]
    else:
        # Clean Pillow dilation fallback
        img = Image.fromarray(rgb.astype(np.uint8))
        mask_im = Image.fromarray((mask * 255).astype(np.uint8), mode='L')
        dilated = img.copy()
        for _ in range(6):
            dilated = dilated.filter(ImageFilter.MaxFilter(5))
        result = Image.composite(img, dilated, mask_im)
        return np.array(result, dtype=np.float32)

def build_suzuki_alto_glb(side_path, rear_path, front_path, out_glb='suzuki_alto_rigged.glb'):
    # 1. Load orthographic views & extrapolate foreground colors
    im_side_rgba = np.array(Image.open(side_path).convert('RGBA'), dtype=np.float32)
    im_rear_rgba = np.array(Image.open(rear_path).convert('RGBA'), dtype=np.float32)
    im_front_rgba = np.array(Image.open(front_path).convert('RGBA'), dtype=np.float32)

    im_side = im_side_rgba[:, :, :3]
    mask_side = (im_side_rgba[:, :, 3] > 64) if (im_side_rgba.shape[2] == 4 and im_side_rgba[:, :, 3].min() < 250) else (im_side.max(axis=2) > 20)
    mask_rear = im_rear_rgba[:, :, 3] > 64
    mask_front = im_front_rgba[:, :, 3] > 64

    # Extract wheel hubcap & tyre texture from front wheel in side view: center=(199, 350), r=95
    wheel_crop = im_side[350-95:350+95, 199-95:199+95].copy()

    # Paint dark wheel well inside the wheel arches on the body side texture so tyres aren't doubled
    yy, xx = np.mgrid[0:im_side.shape[0], 0:im_side.shape[1]]
    for (wx, wy) in [(199, 350), (787, 349)]:
        in_wheel = ((xx - wx)**2 + (yy - wy)**2) < (97**2)
        im_side[in_wheel] = [24, 26, 30]

    side_padded = pad_foreground(im_side, mask_side)
    rear_padded = pad_foreground(im_rear_rgba[:, :, :3], mask_rear)
    front_padded = pad_foreground(im_front_rgba[:, :, :3], mask_front)

    # 2. Build 1024x1024 Texture Atlas:
    # Top half (1024x512): Side profile | Bottom-Left (512x512): Front & Rear | Bottom-Right: Wheel
    atlas = np.full((1024, 1024, 3), 245, dtype=np.uint8)
    atlas[0:512, 0:1024] = np.array(Image.fromarray(side_padded.astype(np.uint8)).resize((1024, 512), Image.LANCZOS))
    atlas[512:1024, 0:256] = np.array(Image.fromarray(front_padded.astype(np.uint8)).resize((256, 512), Image.LANCZOS))
    atlas[512:1024, 256:512] = np.array(Image.fromarray(rear_padded.astype(np.uint8)).resize((256, 512), Image.LANCZOS))
    atlas[512:1024, 512:1024] = np.array(Image.fromarray(wheel_crop.astype(np.uint8)).resize((512, 512), Image.LANCZOS))

    png_buf = io.BytesIO()
    Image.fromarray(atlas).save(png_buf, format='PNG')
    png_bytes = png_buf.getvalue()

    # Save atlas to public folder as well for inspection
    os.makedirs('public/models', exist_ok=True)
    with open('public/models/suzuki_alto_atlas.png', 'wb') as f:
        f.write(png_bytes)

    # 3. Extract exact side silhouette (x=74..897, y=63..392) and build 3D body mesh
    # Length Z: -1.6975m to +1.6975m, Height Y: 0.0m to 1.475m, Width X: -0.7375m to +0.7375m
    nz, nv = 90, 44
    z_vals = np.linspace(-1.6975, 1.6975, nz)
    body_verts, body_norms, body_uvs, body_idx = [], [], [], []

    for i, z in enumerate(z_vals):
        # Map z (+1.6975 front -> x=74 in side image; -1.6975 rear -> x=897 in side image)
        u_side = (1.6975 - z) / 3.395
        px_x = int(np.clip(74 + u_side * (897 - 74), 74, 897))
        col_ys = np.where(mask_side[:, px_x])[0]
        top_px = col_ys.min() if len(col_ys) else 150
        y_top = 1.475 * (444.0 - top_px) / (444.0 - 63.0)
        y_bot = 0.21
        for wz in [-1.213, 1.213]:
            if abs(z - wz) < 0.40:
                y_bot = max(y_bot, 0.366 + np.sqrt(max(0.0, 0.40**2 - (z - wz)**2)))

        for j in range(nv + 1):
            v = j / nv
            theta = v * 2 * np.pi
            nx, ny = np.sin(theta), np.cos(theta)
            # Superellipse cross-section matching Alto boxy profile with tumblehome
            y_frac = 0.5 * (ny + 1.0)
            y = y_bot + y_frac * max(0.15, y_top - y_bot)
            tumble = 1.0 - 0.24 * (y_frac ** 2.2)
            end_taper = 1.0 - 0.14 * (abs(z) / 1.6975) ** 4
            x = np.sign(nx) * (abs(nx) ** 0.35) * 0.7375 * tumble * end_taper

            # Map UV to Side Panel on Atlas
            u_tex = np.clip((px_x / im_side.shape[1]), 0.01, 0.99)
            py_y = 444.0 - (y / 1.475) * (444.0 - 63.0)
            v_tex = np.clip((py_y / im_side.shape[0]) * 0.5, 0.01, 0.49)

            body_verts.append([x, y, z])
            body_norms.append([nx, ny, 0.0])
            body_uvs.append([u_tex, v_tex])

    for i in range(nz - 1):
        for j in range(nv):
            a = i * (nv + 1) + j
            b = (i + 1) * (nv + 1) + j
            c = (i + 1) * (nv + 1) + (j + 1)
            d = i * (nv + 1) + (j + 1)
            body_idx.extend([a, b, c, a, c, d])

    # 4. Build Wheel Mesh centered at (0,0,0) with UVs mapped to the extracted wheel texture
    w_verts, w_norms, w_uvs, w_idx = [], [], [], []
    r_tyre, w_half, segs = 0.366, 0.088, 36
    # Outer & inner faces + tread
    for side_s in [-1.0, 1.0]:
        center_i = len(w_verts)
        w_verts.append([side_s * w_half, 0.0, 0.0])
        w_norms.append([side_s, 0.0, 0.0])
        w_uvs.append([0.75, 0.75])
        for s in range(segs + 1):
            ang = (s / segs) * 2 * np.pi
            cy, cz = np.cos(ang) * r_tyre, np.sin(ang) * r_tyre
            w_verts.append([side_s * w_half, cy, cz])
            w_norms.append([side_s, 0.0, 0.0])
            w_uvs.append([0.75 + 0.24 * np.sin(ang), 0.75 - 0.24 * np.cos(ang)])
        for s in range(segs):
            if side_s > 0:
                w_idx.extend([center_i, center_i + 1 + s, center_i + 2 + s])
            else:
                w_idx.extend([center_i, center_i + 2 + s, center_i + 1 + s])

    tread_base = len(w_verts)
    for s in range(segs + 1):
        ang = (s / segs) * 2 * np.pi
        cy, cz = np.cos(ang) * r_tyre, np.sin(ang) * r_tyre
        for side_s in [-1.0, 1.0]:
            w_verts.append([side_s * w_half, cy, cz])
            w_norms.append([0.0, np.cos(ang), np.sin(ang)])
            w_uvs.append([0.52, 0.52]) # Dark rubber sample
    for s in range(segs):
        k = tread_base + s * 2
        w_idx.extend([k, k + 1, k + 3, k, k + 3, k + 2])

    # 5. Pack binary glTF 2.0 (.glb) with rigged nodes & animation tracks
    bv = np.array(body_verts, dtype=np.float32)
    bn = np.array(body_norms, dtype=np.float32)
    bu = np.array(body_uvs, dtype=np.float32)
    bi = np.array(body_idx, dtype=np.uint32)

    wv = np.array(w_verts, dtype=np.float32)
    wn = np.array(w_norms, dtype=np.float32)
    wu = np.array(w_uvs, dtype=np.float32)
    wi = np.array(w_idx, dtype=np.uint32)

    anim_t = np.array([0.0, 0.5, 1.0, 1.5, 2.0], dtype=np.float32)
    anim_q = np.array([
        [np.sin(a/2), 0.0, 0.0, np.cos(a/2)]
        for a in [0.0, np.pi/2, np.pi, 1.5*np.pi, 2*np.pi]
    ], dtype=np.float32)

    chunks, views, accessors = bytearray(), [], []
    def add_buf(data_bytes, target=None):
        offset = len(chunks)
        chunks.extend(data_bytes)
        while len(chunks) % 4 != 0:
            chunks.append(0)
        v_idx = len(views)
        view = {"buffer": 0, "byteOffset": offset, "byteLength": len(data_bytes)}
        if target:
            view["target"] = target
        views.append(view)
        return v_idx

    def add_acc(arr, comp_type, acc_type, target=None):
        v_idx = add_buf(arr.tobytes(), target)
        acc = {
            "bufferView": v_idx,
            "componentType": comp_type,
            "count": len(arr),
            "type": acc_type,
            "min": arr.min(axis=0).tolist() if arr.ndim > 1 else [float(arr.min())],
            "max": arr.max(axis=0).tolist() if arr.ndim > 1 else [float(arr.max())]
        }
        accessors.append(acc)
        return len(accessors) - 1

    b_pos = add_acc(bv, 5126, "VEC3", 34962)
    b_nor = add_acc(bn, 5126, "VEC3", 34962)
    b_uv  = add_acc(bu, 5126, "VEC2", 34962)
    b_ind = add_acc(bi, 5125, "SCALAR", 34963)

    w_pos = add_acc(wv, 5126, "VEC3", 34962)
    w_nor = add_acc(wn, 5126, "VEC3", 34962)
    w_uv  = add_acc(wu, 5126, "VEC2", 34962)
    w_ind = add_acc(wi, 5125, "SCALAR", 34963)

    t_acc = add_acc(anim_t, 5126, "SCALAR")
    q_acc = add_acc(anim_q, 5126, "VEC4")
    img_view = add_buf(png_bytes)

    gltf = {
        "asset": {"version": "2.0", "generator": "Suzuki Alto Rigged GLB Builder"},
        "scene": 0,
        "scenes": [{"name": "Scene", "nodes": [0]}],
        "nodes": [
            {"name": "Suzuki_Alto_Root", "children": [1, 2, 3, 4, 5]},
            {"name": "Car_Body", "mesh": 0},
            {"name": "Wheel_FL", "mesh": 1, "translation": [ 0.645, 0.366,  1.213]},
            {"name": "Wheel_FR", "mesh": 1, "translation": [-0.645, 0.366,  1.213]},
            {"name": "Wheel_RL", "mesh": 1, "translation": [ 0.645, 0.366, -1.213]},
            {"name": "Wheel_RR", "mesh": 1, "translation": [-0.645, 0.366, -1.213]}
        ],
        "meshes": [
            {"name": "Body_Mesh", "primitives": [{"attributes": {"POSITION": b_pos, "NORMAL": b_nor, "TEXCOORD_0": b_uv}, "indices": b_ind, "material": 0}]},
            {"name": "Wheel_Mesh", "primitives": [{"attributes": {"POSITION": w_pos, "NORMAL": w_nor, "TEXCOORD_0": w_uv}, "indices": w_ind, "material": 0}]}
        ],
        "materials": [{
            "name": "Alto_Atlas_Mat",
            "pbrMetallicRoughness": {"baseColorTexture": {"index": 0}, "metallicFactor": 0.08, "roughnessFactor": 0.30}
        }],
        "textures": [{"source": 0}],
        "images": [{"bufferView": img_view, "mimeType": "image/png"}],
        "animations": [
            {
                "name": "Spin_All_Wheels",
                "samplers": [{"input": t_acc, "interpolation": "LINEAR", "output": q_acc}],
                "channels": [{"sampler": 0, "target": {"node": n, "path": "rotation"}} for n in [2, 3, 4, 5]]
            }
        ],
        "buffers": [{"byteLength": len(chunks)}],
        "bufferViews": views,
        "accessors": accessors
    }

    json_bytes = json.dumps(gltf, separators=(',', ':')).encode('utf-8')
    while len(json_bytes) % 4 != 0:
        json_bytes += b' '

    total_len = 12 + 8 + len(json_bytes) + 8 + len(chunks)
    with open(out_glb, 'wb') as f:
        f.write(struct.pack('<4sII', b'glTF', 2, total_len))
        f.write(struct.pack('<I4s', len(json_bytes), b'JSON'))
        f.write(json_bytes)
        f.write(struct.pack('<I4s', len(chunks), b'BIN\x00'))
        f.write(chunks)
    print(f"Saved rigged GLB to {out_glb} ({total_len/1024:.1f} KB)")

if __name__ == '__main__':
    side = 'car_model/Frame 232.png'
    rear = 'car_model/Frame 233.png'
    front = 'car_model/Frame 234.png'
    out_file = 'public/models/suzuki_alto_phototextured.glb'
    build_suzuki_alto_glb(side, rear, front, out_file)
    # Also save to root as requested
    build_suzuki_alto_glb(side, rear, front, 'suzuki_alto_rigged.glb')
