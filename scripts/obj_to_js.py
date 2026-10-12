"""
Converts suzuki_alto.obj into a clean, standalone ES module src/vehicle/AltoMeshDef.js
"""
import os

def convert():
    obj_path = "public/models/suzuki_alto.obj"
    out_path = "src/vehicle/AltoMeshDef.js"

    vertices = []
    groups = {}
    current_group = "default"

    with open(obj_path, 'r') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if line.startswith('v '):
                parts = [float(p) for p in line.split()[1:]]
                vertices.append(parts)
            elif line.startswith('o '):
                current_group = line.split()[1]
                if current_group not in groups:
                    groups[current_group] = []
            elif line.startswith('f '):
                # 1-based indices to 0-based
                parts = [int(p.split('/')[0]) - 1 for p in line.split()[1:]]
                groups[current_group].append(parts)

    js_code = "// Auto-generated procedural mesh definition for Suzuki Alto HA36\n"
    js_code += f"export const ALTO_VERTICES = {vertices};\n\n"
    js_code += "export const ALTO_GROUPS = {\n"

    for gname, faces in groups.items():
        js_code += f"  '{gname}': {faces},\n"

    js_code += "};\n"

    with open(out_path, 'w') as f:
        f.write(js_code)

    print(f"Exported {len(vertices)} vertices and {len(groups)} groups to {out_path}!")

if __name__ == '__main__':
    convert()
