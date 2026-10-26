from PIL import Image
from PIL import ImageFilter
import os
import glob

base_dir = r"C:\Users\Baver\Downloads"
out_path = os.path.join(base_dir, "prawidlowy_wynik_kolaz_PERFECT.jpg")

tlo_candidates = glob.glob(os.path.join(base_dir, "t*o.jpg")) + glob.glob(os.path.join(base_dir, "t*o.png"))
tlo_file = None
for f in tlo_candidates:
    if "t" in os.path.basename(f).lower() and "o" in os.path.basename(f).lower():
        tlo_file = f
        break

tlo = Image.open(tlo_file).convert("RGB")

# REMOVE LOGO on native
patch_size = 120
patch = tlo.crop((10, tlo.height - patch_size - 10, 10 + patch_size, tlo.height - 10))
tlo.paste(patch, (tlo.width - patch_size - 5, tlo.height - patch_size - 5))
tlo.paste(patch, (tlo.width - patch_size, tlo.height - patch_size))

img1 = Image.open(os.path.join(base_dir, "1.png")).convert("RGBA")
img2 = Image.open(os.path.join(base_dir, "2.png")).convert("RGBA")
img3 = Image.open(os.path.join(base_dir, "3.jpg")).convert("RGBA")
img4 = Image.open(os.path.join(base_dir, "4.jpg")).convert("RGBA")

# SCALE UP TO PRESERVE QUALITY
F = 4.5
tlo = tlo.resize((int(tlo.width * F), int(tlo.height * F)), Image.LANCZOS)

# Create grid images aligned sizes
target_w = int(1800)
grid_gap = int(30 * F)

w1 = target_w; h1 = int(img1.height * (w1 / img1.width)); img1 = img1.resize((w1, h1), Image.LANCZOS)
w4 = target_w; h4 = int(img4.height * (w4 / img4.width)); img4 = img4.resize((w4, h4), Image.LANCZOS)
w2 = target_w; h2 = int(img2.height * (w2 / img2.width)); img2 = img2.resize((w2, h2), Image.LANCZOS)
w3 = target_w; h3 = int(img3.height * (w3 / img3.width)); img3 = img3.resize((w3, h3), Image.LANCZOS)

# Determine the actual grid height needed
y_padding_top = int(35 * F) # margin below "PRAWIDLOWY WYNIK"
y_padding_bottom = int(35 * F) # margin before "NIEPRAWIDLOWY WYNIK"
vertical_img_gap = int(15 * F)

grid_content_h = max(h1, h2) + vertical_img_gap + max(h3, h4)
required_mid_h = grid_content_h + y_padding_top + y_padding_bottom

# Cut TLO into 3 parts
# We estimate native split: top part ends below first banner (~88px natively), bottom part starts above second banner (~260px)
y_split_top = int(90 * F)
y_split_bot = int(260 * F)

top_img = tlo.crop((0, 0, tlo.width, y_split_top))
bot_img = tlo.crop((0, y_split_bot, tlo.width, tlo.height))
mid_img = tlo.crop((0, y_split_top, tlo.width, y_split_bot))

# Resize mid section to fit grid height perfectly (camo stretches seamlessly)
mid_img_adjusted = mid_img.resize((tlo.width, required_mid_h), Image.LANCZOS)

# Reassemble new background
new_h = top_img.height + mid_img_adjusted.height + bot_img.height
new_tlo = Image.new('RGB', (tlo.width, new_h))
new_tlo.paste(top_img, (0, 0))
new_tlo.paste(mid_img_adjusted, (0, top_img.height))
new_tlo.paste(bot_img, (0, top_img.height + mid_img_adjusted.height))

# Calculate coordinates for pasting grid
total_w = target_w * 2 + grid_gap
start_x = (new_tlo.width - total_w) // 2

x_left = start_x
x_right = start_x + target_w + grid_gap

y_row1 = top_img.height + y_padding_top
y_row2 = y_row1 + max(h1, h2) + vertical_img_gap

# Paste images onto the new dynamically sized background
new_tlo.paste(img1, (x_left, y_row1), img1)
new_tlo.paste(img4, (x_left, y_row2), img4)

new_tlo.paste(img2, (x_right, y_row1), img2)
new_tlo.paste(img3, (x_right, y_row2), img3)

new_tlo.save(out_path, quality=100, subsampling=0)
print(f"Zapisano w: {out_path}")
