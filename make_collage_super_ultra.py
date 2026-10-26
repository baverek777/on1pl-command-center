from PIL import Image
from PIL import ImageFilter
import os
import glob

base_dir = r"C:\Users\Baver\Downloads"
out_path = os.path.join(base_dir, "prawidlowy_wynik_kolaz_SUPER_ULTRA.jpg")

tlo_candidates = glob.glob(os.path.join(base_dir, "t*o.jpg")) + glob.glob(os.path.join(base_dir, "t*o.png"))
tlo_file = None
for f in tlo_candidates:
    if "t" in os.path.basename(f).lower() and "o" in os.path.basename(f).lower():
        tlo_file = f
        break

tlo = Image.open(tlo_file).convert("RGB")

# 1. REMOVE LOGO FROM BASE IMAGE
# Logo is in the bottom right corner. We copy a patch of camo from the bottom left to cover it.
patch_size = 120
# Copy from bottom left
patch = tlo.crop((10, tlo.height - patch_size - 10, 10 + patch_size, tlo.height - 10))
# Paste to bottom right
tlo.paste(patch, (tlo.width - patch_size - 5, tlo.height - patch_size - 5))
# Paste slightly offset to make sure
tlo.paste(patch, (tlo.width - patch_size, tlo.height - patch_size))


img1 = Image.open(os.path.join(base_dir, "1.png")).convert("RGBA")
img2 = Image.open(os.path.join(base_dir, "2.png")).convert("RGBA")
img3 = Image.open(os.path.join(base_dir, "3.jpg")).convert("RGBA")
img4 = Image.open(os.path.join(base_dir, "4.jpg")).convert("RGBA")


# 2. SCALE UP MORE TO PRESERVE 100% QUALITY OF THE SCREENSHOTS
# Factor 4.5 gives us absolute pixel-perfect quality since we barely resize the big images!
F = 4.5
tlo = tlo.resize((int(tlo.width * F), int(tlo.height * F)), Image.LANCZOS)

# Scale UI elements (they are small native so we upscale them purely)
h1 = int(img1.height * F * 0.9)
w1 = int(img1.width * (h1 / img1.height))
img1 = img1.resize((w1, h1), Image.LANCZOS)

w2 = int(img2.width * (h1 / img2.height))
img2 = img2.resize((w2, h1), Image.LANCZOS)

# We want img3 and img4 to be around their true native sizes (which is ~1023px width).
h3 = int(120 * F)
w3 = int(img3.width * (h3 / img3.height))
img3 = img3.resize((w3, h3), Image.LANCZOS)

h4 = int(120 * F)
w4 = int(img4.width * (h4 / img4.height))
img4 = img4.resize((w4, h4), Image.LANCZOS)

# Coordinate math
gap1 = int(20 * F)
total_w1 = w1 + gap1 + w2
x1 = (tlo.width - total_w1) // 2
y1 = int(80 * F)

# Use img1 as mask so transparency is respected
tlo.paste(img1, (x1, y1), img1)
tlo.paste(img2, (x1 + w1 + gap1, y1), img2)

gap2 = int(20 * F)
total_w2 = w4 + gap2 + w3
x4 = (tlo.width - total_w2) // 2
y2 = int(135 * F)

tlo.paste(img4, (x4, y2), img4)
tlo.paste(img3, (x4 + w4 + gap2, y2), img3)

tlo.save(out_path, quality=100, subsampling=0)
print(f"Zapisano w: {out_path}")
