from PIL import Image
from PIL import ImageFilter
import os
import glob

base_dir = r"C:\Users\Baver\Downloads"
out_path = os.path.join(base_dir, "prawidlowy_wynik_kolaz_FINAL_FULL.jpg")

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

# SCALE UP TLO
F = 4.5
tlo = tlo.resize((int(tlo.width * F), int(tlo.height * F)), Image.LANCZOS)

# Target layout variables
target_w = int(1800)
grid_gap = int(30 * F)
vertical_img_gap = int(15 * F)
y_padding_top = int(35 * F)    # Below banners
y_padding_bottom = int(35 * F) # Above banners

# HELPER: Scale to width
def scale_to_width(img, bw):
    bh = int(img.height * (bw / img.width))
    return img.resize((bw, bh), Image.LANCZOS)

# -----------------
# TOP GRID (4 images)
# -----------------
img1 = scale_to_width(Image.open(os.path.join(base_dir, "1.png")).convert("RGBA"), target_w)
img2 = scale_to_width(Image.open(os.path.join(base_dir, "2.png")).convert("RGBA"), target_w)
img3 = scale_to_width(Image.open(os.path.join(base_dir, "3.jpg")).convert("RGBA"), target_w)
img4 = scale_to_width(Image.open(os.path.join(base_dir, "4.jpg")).convert("RGBA"), target_w)

grid_top_content_h = max(img1.height, img2.height) + vertical_img_gap + max(img3.height, img4.height)
required_mid_h = grid_top_content_h + y_padding_top + y_padding_bottom

# -----------------
# BOTTOM GRID (4 images)
# -----------------
b_img1 = scale_to_width(Image.open(os.path.join(base_dir, "6.png")).convert("RGBA"), target_w)
b_img2 = scale_to_width(Image.open(os.path.join(base_dir, "7.png")).convert("RGBA"), target_w)
b_img3 = scale_to_width(Image.open(os.path.join(base_dir, "8.png")).convert("RGBA"), target_w)
b_img4 = scale_to_width(Image.open(os.path.join(base_dir, "9.png")).convert("RGBA"), target_w)

grid_bot_content_h = max(b_img1.height, b_img2.height) + vertical_img_gap + max(b_img3.height, b_img4.height)
required_bot_tail_h = grid_bot_content_h + y_padding_top + y_padding_bottom

# -----------------
# SLICE BACKGROUND
# -----------------
y_split_top = int(90 * F)
y_split_mid = int(260 * F)
y_split_bot_banner = int(370 * F) # roughly below the text "NIEPRAWIDLOWY WYNIK"

top_img = tlo.crop((0, 0, tlo.width, y_split_top))
mid_img = tlo.crop((0, y_split_top, tlo.width, y_split_mid))
bot_banner_img = tlo.crop((0, y_split_mid, tlo.width, y_split_bot_banner))
bot_tail_img = tlo.crop((0, y_split_bot_banner, tlo.width, tlo.height))

# Resize camo parts
mid_img_adj = mid_img.resize((tlo.width, required_mid_h), Image.LANCZOS)
bot_tail_img_adj = bot_tail_img.resize((tlo.width, required_bot_tail_h), Image.LANCZOS)

# Assemble new giant background
new_h = top_img.height + mid_img_adj.height + bot_banner_img.height + bot_tail_img_adj.height
new_tlo = Image.new('RGB', (tlo.width, new_h))

curr_y = 0
new_tlo.paste(top_img, (0, curr_y)); curr_y += top_img.height
new_tlo.paste(mid_img_adj, (0, curr_y)); curr_y += mid_img_adj.height
new_tlo.paste(bot_banner_img, (0, curr_y)); curr_y += bot_banner_img.height
new_tlo.paste(bot_tail_img_adj, (0, curr_y))

# -----------------
# PASTE IMAGES
# -----------------
total_w = target_w * 2 + grid_gap
start_x = (new_tlo.width - total_w) // 2

x_left = start_x
x_right = start_x + target_w + grid_gap

# --- Paste Top Grid ---
y_row1 = top_img.height + y_padding_top
y_row2 = y_row1 + max(img1.height, img2.height) + vertical_img_gap

new_tlo.paste(img1, (x_left, y_row1), img1)
new_tlo.paste(img2, (x_right, y_row1), img2)
new_tlo.paste(img4, (x_left, y_row2), img4)  # previously we mapped img4 to left
new_tlo.paste(img3, (x_right, y_row2), img3) # img3 to right

# --- Paste Bottom Grid ---
# Starts after bot_banner_img
bot_grid_start_y = top_img.height + mid_img_adj.height + bot_banner_img.height + y_padding_top

y_row3 = bot_grid_start_y
y_row4 = y_row3 + max(b_img1.height, b_img2.height) + vertical_img_gap

# We paste b_img1 and b_img2 on top row, b_img3 and b_img4 on bottom row
# Wait, img6, img7, img8, img9 -> let's do 1 and 2 on top, 3 and 4 on bottom
new_tlo.paste(b_img1, (x_left, y_row3), b_img1)
new_tlo.paste(b_img2, (x_right, y_row3), b_img2)

# If b_img1 (6.png) is misja nieudana, b_img2 (7.png) is misja wykonana
# b_img3 (8.png) is victory in SE city. b_img4 (9.png) is replay.
new_tlo.paste(b_img3, (x_left, y_row4), b_img3)
new_tlo.paste(b_img4, (x_right, y_row4), b_img4)

new_tlo.save(out_path, quality=98, subsampling=0)
print(f"Zapisano w: {out_path}")
