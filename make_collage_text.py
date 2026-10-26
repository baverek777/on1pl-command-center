from PIL import Image, ImageDraw, ImageFont
import os
import glob

base_dir = r"C:\Users\Baver\Downloads"
out_path = os.path.join(base_dir, "prawidlowy_wynik_kolaz_Z_NAPISAMI.jpg")

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

# INCREASED GAPS FOR TEXT
y_padding_top = int(100 * F)    # Below banners, room for "SCREEN POCZĄTKOWY"
vertical_img_gap = int(100 * F) # Between rows, room for "SCREEN KOŃCOWY"
y_padding_bottom = int(40 * F) # Above banners

def scale_to_width(img, bw):
    bh = int(img.height * (bw / img.width))
    return img.resize((bw, bh), Image.LANCZOS)

# TOP GRID
img1 = scale_to_width(Image.open(os.path.join(base_dir, "1.png")).convert("RGBA"), target_w)
img2 = scale_to_width(Image.open(os.path.join(base_dir, "2.png")).convert("RGBA"), target_w)
img3 = scale_to_width(Image.open(os.path.join(base_dir, "3.jpg")).convert("RGBA"), target_w)
img4 = scale_to_width(Image.open(os.path.join(base_dir, "4.jpg")).convert("RGBA"), target_w)

grid_top_content_h = max(img1.height, img2.height) + vertical_img_gap + max(img3.height, img4.height)
required_mid_h = grid_top_content_h + y_padding_top + y_padding_bottom

# BOTTOM GRID
b_img1 = scale_to_width(Image.open(os.path.join(base_dir, "6.png")).convert("RGBA"), target_w)
b_img2 = scale_to_width(Image.open(os.path.join(base_dir, "7.png")).convert("RGBA"), target_w)
b_img3 = scale_to_width(Image.open(os.path.join(base_dir, "8.png")).convert("RGBA"), target_w)
b_img4 = scale_to_width(Image.open(os.path.join(base_dir, "9.png")).convert("RGBA"), target_w)

grid_bot_content_h = max(b_img1.height, b_img2.height) + vertical_img_gap + max(b_img3.height, b_img4.height)
required_bot_tail_h = grid_bot_content_h + y_padding_top + y_padding_bottom

# SLICE BACKGROUND
y_split_top = int(90 * F)
y_split_mid = int(260 * F)
y_split_bot_banner = int(370 * F)

top_img = tlo.crop((0, 0, tlo.width, y_split_top))
mid_img = tlo.crop((0, y_split_top, tlo.width, y_split_mid))
bot_banner_img = tlo.crop((0, y_split_mid, tlo.width, y_split_bot_banner))
bot_tail_img = tlo.crop((0, y_split_bot_banner, tlo.width, tlo.height))

mid_img_adj = mid_img.resize((tlo.width, required_mid_h), Image.LANCZOS)
bot_tail_img_adj = bot_tail_img.resize((tlo.width, required_bot_tail_h), Image.LANCZOS)

new_h = top_img.height + mid_img_adj.height + bot_banner_img.height + bot_tail_img_adj.height
new_tlo = Image.new('RGB', (tlo.width, new_h))

curr_y = 0
new_tlo.paste(top_img, (0, curr_y)); curr_y += top_img.height
new_tlo.paste(mid_img_adj, (0, curr_y)); curr_y += mid_img_adj.height
new_tlo.paste(bot_banner_img, (0, curr_y)); curr_y += bot_banner_img.height
new_tlo.paste(bot_tail_img_adj, (0, curr_y))

# TEXT PREP
draw = ImageDraw.Draw(new_tlo)
font_path = r"C:\Windows\Fonts\impact.ttf"
if not os.path.exists(font_path):
    font_path = r"C:\Windows\Fonts\arialbd.ttf"
try:
    font = ImageFont.truetype(font_path, size=int(50 * F))
    font_ok = True
except:
    font_ok = False

def draw_centered_text(text, y_pos):
    if not font_ok: return
    bbox = draw.textbbox((0, 0), text, font=font)
    w = bbox[2] - bbox[0]
    x = (new_tlo.width - w) // 2
    draw.text((x, y_pos), text, font=font, fill="white", stroke_width=int(2*F), stroke_fill="black")

total_w = target_w * 2 + grid_gap
start_x = (new_tlo.width - total_w) // 2
x_left = start_x
x_right = start_x + target_w + grid_gap

# PASTE TOP GRID
y_row1 = top_img.height + y_padding_top
y_row2 = y_row1 + max(img1.height, img2.height) + vertical_img_gap

draw_centered_text("SCREEN POCZ\u0104TKOWY", top_img.height + int(20 * F))
new_tlo.paste(img1, (x_left, y_row1), img1)
new_tlo.paste(img2, (x_right, y_row1), img2)

draw_centered_text("SCREEN KO\u0143COWY", y_row1 + max(img1.height, img2.height) + int(20 * F))
new_tlo.paste(img4, (x_left, y_row2), img4)
new_tlo.paste(img3, (x_right, y_row2), img3)


# PASTE BOTTOM GRID
bot_grid_start_y = top_img.height + mid_img_adj.height + bot_banner_img.height + y_padding_top

y_row3 = bot_grid_start_y
y_row4 = y_row3 + max(b_img1.height, b_img2.height) + vertical_img_gap

draw_centered_text("SCREEN POCZ\u0104TKOWY", bot_grid_start_y - y_padding_top + int(20 * F))
new_tlo.paste(b_img1, (x_left, y_row3), b_img1)
new_tlo.paste(b_img2, (x_right, y_row3), b_img2)

draw_centered_text("SCREEN KO\u0143COWY", y_row3 + max(b_img1.height, b_img2.height) + int(20 * F))
new_tlo.paste(b_img3, (x_left, y_row4), b_img3)
new_tlo.paste(b_img4, (x_right, y_row4), b_img4)

new_tlo.save(out_path, quality=98, subsampling=0)
print(f"Zapisano w: {out_path}")
