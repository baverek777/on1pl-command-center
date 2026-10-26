from PIL import Image
from PIL import ImageFilter
import os
import glob

base_dir = r"C:\Users\Baver\Downloads"
out_path = os.path.join(base_dir, "prawidlowy_wynik_kolaz_ALIGNED.jpg")

tlo_candidates = glob.glob(os.path.join(base_dir, "t*o.jpg")) + glob.glob(os.path.join(base_dir, "t*o.png"))
tlo_file = None
for f in tlo_candidates:
    if "t" in os.path.basename(f).lower() and "o" in os.path.basename(f).lower():
        tlo_file = f
        break

tlo = Image.open(tlo_file).convert("RGB")

# REMOVE LOGO
patch_size = 120
patch = tlo.crop((10, tlo.height - patch_size - 10, 10 + patch_size, tlo.height - 10))
tlo.paste(patch, (tlo.width - patch_size - 5, tlo.height - patch_size - 5))
tlo.paste(patch, (tlo.width - patch_size, tlo.height - patch_size))

img1 = Image.open(os.path.join(base_dir, "1.png")).convert("RGBA")
img2 = Image.open(os.path.join(base_dir, "2.png")).convert("RGBA")
img3 = Image.open(os.path.join(base_dir, "3.jpg")).convert("RGBA")
img4 = Image.open(os.path.join(base_dir, "4.jpg")).convert("RGBA")

# SCALE BACKGROUND
F = 4.5
tlo = tlo.resize((int(tlo.width * F), int(tlo.height * F)), Image.LANCZOS)

# SET UNIFORM WIDTH FOR PERFECT GRID ALIGNMENT
grid_gap = int(30 * F)
target_w = int(1800) # Width for left column and right column each

# LEFT COLUMN: img1 (top), img4 (bottom)
# img1
w1 = target_w
h1 = int(img1.height * (w1 / img1.width))
img1 = img1.resize((w1, h1), Image.LANCZOS)

# img4
w4 = target_w
h4 = int(img4.height * (w4 / img4.width))
img4 = img4.resize((w4, h4), Image.LANCZOS)

# RIGHT COLUMN: img2 (top), img3 (bottom)
# img2
w2 = target_w
h2 = int(img2.height * (w2 / img2.width))
img2 = img2.resize((w2, h2), Image.LANCZOS)

# img3
w3 = target_w
h3 = int(img3.height * (w3 / img3.width))
img3 = img3.resize((w3, h3), Image.LANCZOS)

# Position variables
total_w = target_w + grid_gap + target_w
start_x = (tlo.width - total_w) // 2

x_left = start_x
x_right = start_x + target_w + grid_gap

# Calculate Y positions
y_top = int(75 * F)
vertical_gap = int(10 * F)
y_bottom = y_top + max(h1, h2) + vertical_gap

# Paste images
tlo.paste(img1, (x_left, y_top), img1)
tlo.paste(img4, (x_left, y_bottom), img4)

tlo.paste(img2, (x_right, y_top), img2)
tlo.paste(img3, (x_right, y_bottom), img3)

tlo.save(out_path, quality=100, subsampling=0)
print(f"Zapisano w: {out_path}")
