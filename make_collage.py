from PIL import Image
from PIL import ImageFilter
import os
import glob

# Paths
base_dir = r"C:\Users\Baver\Downloads"
out_path = os.path.join(base_dir, "prawidlowy_wynik_kolaz.jpg")

# Find background
tlo_candidates = glob.glob(os.path.join(base_dir, "t*o.jpg")) + glob.glob(os.path.join(base_dir, "t*o.png"))
tlo_file = None
for f in tlo_candidates:
    if "t" in os.path.basename(f).lower() and "o" in os.path.basename(f).lower(): # lazy match for tlo.jpg
        tlo_file = f
        break

if not tlo_file:
    print("Nie znaleziono tlo.jpg")
    exit(1)

# Open images
tlo = Image.open(tlo_file).convert("RGB")
img1 = Image.open(os.path.join(base_dir, "1.png")).convert("RGBA")
img2 = Image.open(os.path.join(base_dir, "2.png")).convert("RGBA")
img3 = Image.open(os.path.join(base_dir, "3.jpg")).convert("RGBA")
img4 = Image.open(os.path.join(base_dir, "4.jpg")).convert("RGBA")

# Target space: approximately y=90 to y=270, x=0 to 1024
# We will create a small layout here. 

# Scale down 1.png and 2.png to height 45
h1 = 45
w1 = int(img1.width * (h1 / img1.height))
img1 = img1.resize((w1, h1), Image.LANCZOS)

w2 = int(img2.width * (h1 / img2.height))
img2 = img2.resize((w2, h1), Image.LANCZOS)

# Scale down 3.jpg and 4.jpg to height 120
h3 = 120
w3 = int(img3.width * (h3 / img3.height))
img3 = img3.resize((w3, h3), Image.LANCZOS)

w4 = int(img4.width * (h3 / img4.height))
img4 = img4.resize((w4, h3), Image.LANCZOS)

# Coordinates
# Center everything horizontally
# Row 1 (y=90): img1 and img2 with 20px gap
gap1 = 20
total_w1 = w1 + gap1 + w2
x1 = (tlo.width - total_w1) // 2
y1 = 85

# Paste Row 1
tlo.paste(img1, (x1, y1), img1)
tlo.paste(img2, (x1 + w1 + gap1, y1), img2)

# Row 2 (y=140): img4 and img3 with 20px gap
gap2 = 20
total_w2 = w4 + gap2 + w3
x4 = (tlo.width - total_w2) // 2
y2 = 135

tlo.paste(img4, (x4, y2), img4)
tlo.paste(img3, (x4 + w4 + gap2, y2), img3)

# Save
tlo.save(out_path, quality=95)
print(f"Zapisano w: {out_path}")
