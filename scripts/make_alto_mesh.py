"""
Procedural 3D Mesh Generator for Suzuki Alto HA36S
Generates a watertight, low-poly OBJ model with separate groups:
- Body (Paint_White)
- Windows (Glass_Tinted)
- Trim (Black_Plastic)
- Grille (Grille_Chrome)
- Headlights (Headlight_Lens / Amber_Turn)
- Taillights (Taillight_Red / Reverse_White)
- Interior (Dashboard, Steering, Seats with Headrests)
- Accessories (Mirrors, Door Handles, Antenna)
"""
import math
import os

class ObjBuilder:
    def __init__(self):
        self.vertices = []
        self.groups = {}
        self.current_group = "default"
        self.current_material = "default"

    def set_group(self, name, material="default"):
        self.current_group = name
        self.current_material = material
        if name not in self.groups:
            self.groups[name] = {"material": material, "faces": []}

    def add_vertex(self, x, y, z):
        self.vertices.append((round(x, 4), round(y, 4), round(z, 4)))
        return len(self.vertices) # 1-based index

    def add_quad(self, v1, v2, v3, v4):
        self.groups[self.current_group]["faces"].append([v1, v2, v3, v4])

    def add_tri(self, v1, v2, v3):
        self.groups[self.current_group]["faces"].append([v1, v2, v3])

    def add_box(self, cx, cy, cz, wx, wy, wz):
        hx, hy, hz = wx / 2, wy / 2, wz / 2
        v1 = self.add_vertex(cx - hx, cy - hy, cz + hz)
        v2 = self.add_vertex(cx + hx, cy - hy, cz + hz)
        v3 = self.add_vertex(cx + hx, cy + hy, cz + hz)
        v4 = self.add_vertex(cx - hx, cy + hy, cz + hz)
        v5 = self.add_vertex(cx - hx, cy - hy, cz - hz)
        v6 = self.add_vertex(cx + hx, cy - hy, cz - hz)
        v7 = self.add_vertex(cx + hx, cy + hy, cz - hz)
        v8 = self.add_vertex(cx - hx, cy + hy, cz - hz)
        # Front
        self.add_quad(v1, v2, v3, v4)
        # Back
        self.add_quad(v6, v5, v8, v7)
        # Top
        self.add_quad(v4, v3, v7, v8)
        # Bottom
        self.add_quad(v5, v6, v2, v1)
        # Right
        self.add_quad(v2, v6, v7, v3)
        # Left
        self.add_quad(v5, v1, v4, v8)

    def write_obj(self, filepath):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, 'w') as f:
            f.write("# Suzuki Alto HA36S Low-Poly 3D Model\n")
            for v in self.vertices:
                f.write(f"v {v[0]:.4f} {v[1]:.4f} {v[2]:.4f}\n")
            
            for gname, gdata in self.groups.items():
                f.write(f"\no {gname}\n")
                f.write(f"usemtl {gdata['material']}\n")
                for face in gdata["faces"]:
                    if len(face) == 4:
                        f.write(f"f {face[0]} {face[1]} {face[2]} {face[3]}\n")
                    elif len(face) == 3:
                        f.write(f"f {face[0]} {face[1]} {face[2]}\n")

def build_suzuki_alto():
    builder = ObjBuilder()

    def add_sym(x, y, z):
        if abs(x) < 0.001:
            idx = builder.add_vertex(0, y, z)
            return (idx, idx)
        r = builder.add_vertex(x, y, z)
        l = builder.add_vertex(-x, y, z)
        return (r, l)

    # ==========================================
    # 1. CAR BODY (Alpine White)
    # ==========================================
    builder.set_group("Car_Body", "Paint_White")

    # Roof points
    r_front_c = add_sym(0, 1.48, 0.26)[0]
    r_front = add_sym(0.58, 1.46, 0.26)
    r_b_c = add_sym(0, 1.48, -0.22)[0]
    r_b = add_sym(0.59, 1.46, -0.22)
    r_kink_c = add_sym(0, 1.48, -0.66)[0]
    r_kink = add_sym(0.59, 1.46, -0.66)
    r_rear_c = add_sym(0, 1.46, -1.34)[0]
    r_rear = add_sym(0.57, 1.44, -1.34)

    # Roof faces
    builder.add_quad(r_front_c, r_front[0], r_b[0], r_b_c)
    builder.add_quad(r_front_c, r_b_c, r_b[1], r_front[1])
    builder.add_quad(r_b_c, r_b[0], r_kink[0], r_kink_c)
    builder.add_quad(r_b_c, r_kink_c, r_kink[1], r_kink[1])
    builder.add_quad(r_kink_c, r_kink[0], r_rear[0], r_rear_c)
    builder.add_quad(r_kink_c, r_rear_c, r_rear[1], r_kink[1])

    # Cowl / Windshield Base
    cowl_c = add_sym(0, 0.90, 0.68)[0]
    cowl = add_sym(0.62, 0.90, 0.68)

    # Front Hood
    hood_mid_c = add_sym(0, 0.82, 1.12)[0]
    hood_mid = add_sym(0.66, 0.80, 1.12)
    hood_front_c = add_sym(0, 0.76, 1.54)[0]
    hood_front = add_sym(0.66, 0.74, 1.54)

    builder.add_quad(cowl_c, cowl[0], hood_mid[0], hood_mid_c)
    builder.add_quad(cowl_c, hood_mid_c, hood_mid[1], cowl[1])
    builder.add_quad(hood_mid_c, hood_mid[0], hood_front[0], hood_front_c)
    builder.add_quad(hood_mid_c, hood_front_c, hood_front[1], hood_mid[1])

    # Front Fascia & Front Bumper
    nose_c = add_sym(0, 0.48, 1.68)[0]
    nose = add_sym(0.68, 0.48, 1.64)
    lip_c = add_sym(0, 0.22, 1.66)[0]
    lip = add_sym(0.67, 0.22, 1.60)

    builder.add_quad(hood_front_c, hood_front[0], nose[0], nose_c)
    builder.add_quad(hood_front_c, nose_c, nose[1], hood_front[1])
    builder.add_quad(nose_c, nose[0], lip[0], lip_c)
    builder.add_quad(nose_c, lip_c, lip[1], nose[1])

    # Rear Hatch & Rear Bumper
    hatch_mid_c = add_sym(0, 0.86, -1.52)[0]
    hatch_mid = add_sym(0.64, 0.86, -1.50)
    rear_bump_c = add_sym(0, 0.48, -1.64)[0]
    rear_bump = add_sym(0.66, 0.48, -1.60)
    rear_lip_c = add_sym(0, 0.22, -1.62)[0]
    rear_lip = add_sym(0.65, 0.22, -1.58)

    builder.add_quad(hatch_mid_c, hatch_mid[0], rear_bump[0], rear_bump_c)
    builder.add_quad(hatch_mid_c, rear_bump_c, rear_bump[1], hatch_mid[1])
    builder.add_quad(rear_bump_c, rear_bump[0], rear_lip[0], rear_lip_c)
    builder.add_quad(rear_bump_c, rear_lip_c, rear_lip[1], rear_bump[1])

    # Sides & Wheel Arch Cutouts
    belt_front = add_sym(0.72, 0.88, 0.68)
    belt_b = add_sym(0.72, 0.88, -0.22)
    belt_kink_start = add_sym(0.72, 0.88, -0.66)
    belt_kink_top = add_sym(0.70, 1.22, -1.08) # Alto beltline kink!

    rocker_front_wheel_f = add_sym(0.72, 0.22, 1.42)
    rocker_front_wheel_r = add_sym(0.72, 0.22, 0.74)
    arch_f_top = add_sym(0.74, 0.60, 1.08)

    rocker_mid = add_sym(0.72, 0.22, -0.22)

    rocker_rear_wheel_f = add_sym(0.72, 0.22, -0.80)
    rocker_rear_wheel_r = add_sym(0.72, 0.22, -1.48)
    arch_r_top = add_sym(0.74, 0.60, -1.14)

    # Side Panels
    for s in (0, 1):
        builder.add_quad(hood_front[s], hood_mid[s], arch_f_top[s], nose[s])
        builder.add_quad(nose[s], arch_f_top[s], rocker_front_wheel_f[s], lip[s])

        builder.add_quad(hood_mid[s], cowl[s], belt_front[s], arch_f_top[s])
        builder.add_quad(arch_f_top[s], belt_front[s], rocker_front_wheel_r[s], rocker_front_wheel_r[s])

        builder.add_quad(belt_front[s], belt_b[s], rocker_mid[s], rocker_front_wheel_r[s])
        builder.add_quad(belt_b[s], belt_kink_start[s], rocker_rear_wheel_f[s], rocker_mid[s])

        # Distinct Alto Kink Infill
        builder.add_quad(belt_kink_start[s], belt_kink_top[s], arch_r_top[s], rocker_rear_wheel_f[s])

        # Solid C-Pillar
        builder.add_quad(r_kink[s], r_rear[s], hatch_mid[s], belt_kink_top[s])

        builder.add_quad(belt_kink_top[s], hatch_mid[s], rear_bump[s], arch_r_top[s])
        builder.add_quad(arch_r_top[s], rear_bump[s], rear_lip[s], rocker_rear_wheel_r[s])

    # A-Pillars (White body paint strips flanking windshield)
    builder.add_quad(r_front[0], cowl[0], cowl[0], r_front[0])
    builder.add_quad(r_front[1], cowl[1], cowl[1], r_front[1])

    # Underbody
    builder.set_group("Car_Underbody", "Black_Trim")
    builder.add_quad(lip[0], lip_c, rear_lip_c, rear_lip[0])
    builder.add_quad(lip_c, lip[1], rear_lip[1], rear_lip_c)

    # ==========================================
    # 2. WINDOWS (Tinted Glass)
    # ==========================================
    builder.set_group("Car_Windows", "Glass_Tinted")
    # Windshield
    builder.add_quad(r_front_c, r_front[0], cowl[0], cowl_c)
    builder.add_quad(r_front_c, cowl_c, cowl[1], r_front[1])

    # Rear Hatch Window
    builder.add_quad(r_rear_c, r_rear[0], hatch_mid[0], hatch_mid_c)
    builder.add_quad(r_rear_c, hatch_mid_c, hatch_mid[1], r_rear[1])

    # Front Door Windows
    builder.add_quad(r_front[0], r_b[0], belt_b[0], belt_front[0])
    builder.add_quad(r_front[1], belt_front[1], belt_b[1], r_b[1])

    # Rear Door Windows with Upward Kink!
    builder.add_quad(r_b[0], r_kink[0], belt_kink_top[0], belt_b[0])
    builder.add_quad(r_b[1], belt_b[1], belt_kink_top[1], r_kink[1])
    builder.add_tri(belt_b[0], belt_kink_top[0], belt_kink_start[0])
    builder.add_tri(belt_b[1], belt_kink_start[1], belt_kink_top[1])

    # ==========================================
    # 3. MATTE BLACK B-PILLAR
    # ==========================================
    builder.set_group("Car_BPillars", "Black_Trim")
    for s, x_dir in [(0, 1), (1, -1)]:
        b1 = builder.add_vertex(x_dir * 0.70, 1.45, -0.20)
        b2 = builder.add_vertex(x_dir * 0.70, 1.45, -0.24)
        b3 = builder.add_vertex(x_dir * 0.70, 0.88, -0.24)
        b4 = builder.add_vertex(x_dir * 0.70, 0.88, -0.20)
        if x_dir > 0:
            builder.add_quad(b1, b2, b3, b4)
        else:
            builder.add_quad(b1, b4, b3, b2)

    # ==========================================
    # 4. ASYMMETRIC FRONT GRILLE (HA36 Iconic Face)
    # ==========================================
    builder.set_group("Car_Grille", "Black_Trim")
    g_tl = builder.add_vertex(-0.35, 0.74, 1.66)
    g_tr = builder.add_vertex(0.35, 0.74, 1.66)
    g_br = builder.add_vertex(0.35, 0.60, 1.66)
    g_bl = builder.add_vertex(-0.35, 0.60, 1.66)
    builder.add_quad(g_tl, g_tr, g_br, g_bl)

    # 4 Vertical Chrome Slits on viewer left
    builder.set_group("Car_Grille_Slits", "Chrome")
    for x_s in [-0.27, -0.21, -0.15, -0.09]:
        s1 = builder.add_vertex(x_s - 0.012, 0.72, 1.67)
        s2 = builder.add_vertex(x_s + 0.012, 0.72, 1.67)
        s3 = builder.add_vertex(x_s + 0.012, 0.62, 1.67)
        s4 = builder.add_vertex(x_s - 0.012, 0.62, 1.67)
        builder.add_quad(s1, s2, s3, s4)

    # Suzuki 'S' Emblem
    s_c1 = builder.add_vertex(-0.04, 0.71, 1.675)
    s_c2 = builder.add_vertex(0.04, 0.71, 1.675)
    s_c3 = builder.add_vertex(0.04, 0.63, 1.675)
    s_c4 = builder.add_vertex(-0.04, 0.63, 1.675)
    builder.add_quad(s_c1, s_c2, s_c3, s_c4)

    # 1 Horizontal Slot on passenger side
    h1 = builder.add_vertex(0.12, 0.68, 1.67)
    h2 = builder.add_vertex(0.26, 0.68, 1.67)
    h3 = builder.add_vertex(0.26, 0.65, 1.67)
    h4 = builder.add_vertex(0.12, 0.65, 1.67)
    builder.add_quad(h1, h2, h3, h4)

    # ==========================================
    # 5. HEADLIGHTS & TURN SIGNALS
    # ==========================================
    builder.set_group("Car_Headlights", "Headlight_Lens")
    for s, x_dir in [(0, 1), (1, -1)]:
        hl1 = builder.add_vertex(x_dir * 0.40, 0.74, 1.63)
        hl2 = builder.add_vertex(x_dir * 0.66, 0.73, 1.57)
        hl3 = builder.add_vertex(x_dir * 0.67, 0.60, 1.59)
        hl4 = builder.add_vertex(x_dir * 0.40, 0.60, 1.64)
        if x_dir > 0:
            builder.add_quad(hl1, hl2, hl3, hl4)
        else:
            builder.add_quad(hl1, hl4, hl3, hl2)

    builder.set_group("Car_TurnSignals", "Amber_Lens")
    for s, x_dir in [(0, 1), (1, -1)]:
        amb1 = builder.add_vertex(x_dir * 0.60, 0.65, 1.60)
        amb2 = builder.add_vertex(x_dir * 0.67, 0.64, 1.58)
        amb3 = builder.add_vertex(x_dir * 0.67, 0.60, 1.59)
        amb4 = builder.add_vertex(x_dir * 0.60, 0.60, 1.61)
        if x_dir > 0:
            builder.add_quad(amb1, amb2, amb3, amb4)
        else:
            builder.add_quad(amb1, amb4, amb3, amb2)

    # ==========================================
    # 6. FRONT LOWER INTAKE & LICENSE PLATE
    # ==========================================
    builder.set_group("Car_LowerIntake", "Black_Trim")
    in1 = builder.add_vertex(-0.48, 0.46, 1.69)
    in2 = builder.add_vertex(0.48, 0.46, 1.69)
    in3 = builder.add_vertex(0.48, 0.32, 1.67)
    in4 = builder.add_vertex(-0.48, 0.32, 1.67)
    builder.add_quad(in1, in2, in3, in4)

    builder.set_group("Car_LicensePlate", "License_Plate")
    lp1 = builder.add_vertex(-0.18, 0.45, 1.70)
    lp2 = builder.add_vertex(0.18, 0.45, 1.70)
    lp3 = builder.add_vertex(0.18, 0.33, 1.70)
    lp4 = builder.add_vertex(-0.18, 0.33, 1.70)
    builder.add_quad(lp1, lp2, lp3, lp4)

    # ==========================================
    # 7. REAR BUMPER TAILLIGHTS (IN THE BUMPER!)
    # ==========================================
    builder.set_group("Car_Taillights_Red", "Taillight_Red")
    for s, x_dir in [(0, 1), (1, -1)]:
        tr1 = builder.add_vertex(x_dir * 0.46, 0.50, -1.63)
        tr2 = builder.add_vertex(x_dir * 0.64, 0.49, -1.61)
        tr3 = builder.add_vertex(x_dir * 0.64, 0.41, -1.61)
        tr4 = builder.add_vertex(x_dir * 0.46, 0.41, -1.63)
        if x_dir > 0:
            builder.add_quad(tr1, tr4, tr3, tr2)
        else:
            builder.add_quad(tr1, tr2, tr3, tr4)

    builder.set_group("Car_Taillights_Clear", "Reverse_White")
    for s, x_dir in [(0, 1), (1, -1)]:
        cw1 = builder.add_vertex(x_dir * 0.36, 0.50, -1.64)
        cw2 = builder.add_vertex(x_dir * 0.45, 0.50, -1.63)
        cw3 = builder.add_vertex(x_dir * 0.45, 0.41, -1.63)
        cw4 = builder.add_vertex(x_dir * 0.36, 0.41, -1.64)
        if x_dir > 0:
            builder.add_quad(cw1, cw4, cw3, cw2)
        else:
            builder.add_quad(cw1, cw2, cw3, cw4)

    builder.set_group("Car_HighBrake", "High_Brake")
    hb1 = builder.add_vertex(-0.12, 1.48, -1.35)
    hb2 = builder.add_vertex(0.12, 1.48, -1.35)
    hb3 = builder.add_vertex(0.12, 1.45, -1.35)
    hb4 = builder.add_vertex(-0.12, 1.45, -1.35)
    builder.add_quad(hb1, hb4, hb3, hb2)

    builder.set_group("Car_RearPlate", "License_Plate")
    rp1 = builder.add_vertex(-0.18, 0.45, -1.65)
    rp2 = builder.add_vertex(0.18, 0.45, -1.65)
    rp3 = builder.add_vertex(0.18, 0.33, -1.65)
    rp4 = builder.add_vertex(-0.18, 0.33, -1.65)
    builder.add_quad(rp1, rp4, rp3, rp2)

    builder.set_group("Car_RearBadges", "Chrome")
    rs1 = builder.add_vertex(-0.035, 0.82, -1.53)
    rs2 = builder.add_vertex(0.035, 0.82, -1.53)
    rs3 = builder.add_vertex(0.035, 0.75, -1.53)
    rs4 = builder.add_vertex(-0.035, 0.75, -1.53)
    builder.add_quad(rs1, rs4, rs3, rs2)

    ab1 = builder.add_vertex(0.38, 0.72, -1.53)
    ab2 = builder.add_vertex(0.54, 0.72, -1.53)
    ab3 = builder.add_vertex(0.54, 0.68, -1.53)
    ab4 = builder.add_vertex(0.38, 0.68, -1.53)
    builder.add_quad(ab1, ab4, ab3, ab2)

    # ==========================================
    # 8. SIDE MIRRORS & DOOR HANDLES
    # ==========================================
    builder.set_group("Car_Mirrors", "Paint_White")
    for s, x_dir in [(0, 1), (1, -1)]:
        # Mirror body shell
        builder.add_box(x_dir * 0.78, 1.05, 0.62, 0.12, 0.08, 0.14)

    builder.set_group("Car_MirrorGlass", "Chrome")
    for s, x_dir in [(0, 1), (1, -1)]:
        m1 = builder.add_vertex(x_dir * 0.72, 1.08, 0.55)
        m2 = builder.add_vertex(x_dir * 0.84, 1.08, 0.55)
        m3 = builder.add_vertex(x_dir * 0.84, 1.02, 0.55)
        m4 = builder.add_vertex(x_dir * 0.72, 1.02, 0.55)
        if x_dir > 0:
            builder.add_quad(m1, m4, m3, m2)
        else:
            builder.add_quad(m1, m2, m3, m4)

    builder.set_group("Car_DoorHandles", "Chrome")
    for s, x_dir in [(0, 1), (1, -1)]:
        builder.add_box(x_dir * 0.73, 0.88, 0.14, 0.015, 0.03, 0.11)
        builder.add_box(x_dir * 0.73, 0.88, -0.46, 0.015, 0.03, 0.11)

    # ==========================================
    # 9. INTERIOR CABIN (Dashboard, Seats, Steering)
    # ==========================================
    builder.set_group("Car_Interior", "Interior_Dark")
    # Dashboard
    builder.add_box(0, 0.90, 0.60, 1.20, 0.16, 0.38)

    # Front Bucket Seats with Headrests
    for s, x_dir in [(0, 1), (1, -1)]:
        # Seat cushion
        builder.add_box(x_dir * 0.32, 0.72, 0.12, 0.40, 0.12, 0.40)
        # Backrest
        builder.add_box(x_dir * 0.32, 0.96, -0.06, 0.38, 0.40, 0.10)
        # Headrest
        builder.add_box(x_dir * 0.32, 1.22, -0.09, 0.20, 0.14, 0.08)

    # Rear bench
    builder.add_box(0, 0.74, -0.70, 1.14, 0.36, 0.40)

    # Rear Stub Antenna
    builder.set_group("Car_Antenna", "Black_Trim")
    builder.add_box(0, 1.50, -1.05, 0.03, 0.02, 0.05)

    output_path = "public/models/suzuki_alto.obj"
    builder.write_obj(output_path)
    print(f"Successfully generated {output_path} with {len(builder.vertices)} vertices across {len(builder.groups)} groups!")

if __name__ == "__main__":
    build_suzuki_alto()
