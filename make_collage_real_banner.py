from PIL import Image, ImageDraw, ImageFont
import os
import glob

base_dir = r"C:\Users\Baver\Downloads"
out_path = os.path.join(base_dir, "prawidlowy_wynik_kolaz_COPY_BANNER.jpg")

tlo_candidates = glob.glob(os.path.join(base_dir, "t*o.jpg")) + glob.glob(os.path.join(base_dir, "t*o.png"))
tlo_file = None
for f in tlo_candidates:
    if "t" in os.path.basename(f).lower() and "o" in os.path.basename(f).lower():
        tlo_file = f
        break

tlo_orig = Image.open(tlo_file).convert("RGB")

# REMOVE LOGO
patch_size = 120
patch = tlo_orig.crop((10, tlo_orig.height - patch_size - 10, 10 + patch_size, tlo_orig.height - 10))
tlo_orig.paste(patch, (tlo_orig.width - patch_size - 5, tlo_orig.height - patch_size - 5))
tlo_orig.paste(patch, (tlo_orig.width - patch_size, tlo_orig.height - patch_size))

# EXTRACT EMPTY BANNER PIECES (areas without text)
# Left piece: x=200..250 — before text starts
# Right piece: x=820..840 — after text ends
baner_y1, baner_y2 = 25, 100    # native pixel coords

left_piece = tlo_orig.crop((200, baner_y1, 245, baner_y2))   # ~45px wide strip
right_piece = tlo_orig.crop((800, baner_y1, 840, baner_y2))  # ~40px wide strip

def build_empty_banner(target_width, target_height):
    """Build a fresh, empty banner by stretching the left/right edge texture."""
    banner = Image.new('RGB', (target_width, target_height))
    
    # Scale each piece to banner height
    lp = left_piece.resize((left_piece.width, target_height), Image.LANCZOS)
    rp = right_piece.resize((right_piece.width, target_height), Image.LANCZOS)
    
    # Fill middle: stretch a 1-pixel slice from the center of the left piece
    mid_w = target_width - lp.width - rp.width
    mid_col = lp.crop((lp.width-1, 0, lp.width, target_height))
    mid_fill = mid_col.resize((mid_w, target_height), Image.LANCZOS)
    
    banner.paste(lp, (0, 0))
    banner.paste(mid_fill, (lp.width, 0))
    banner.paste(rp, (lp.width + mid_w, 0))
    return banner

# SCALE UP
F = 4.5
tlo = tlo_orig.resize((int(tlo_orig.width * F), int(tlo_orig.height * F)), Image.LANCZOS)

# Layout
target_w = int(1800)
grid_gap = int(30 * F)
y_padding_top = int(150 * F)
vertical_img_gap = int(150 * F)
y_padding_bottom = int(40 * F)

def scale_to_width(img, bw):
    bh = int(img.height * (bw / img.width))
    return img.resize((bw, bh), Image.LANCZOS)

img1 = scale_to_width(Image.open(os.path.join(base_dir, "1.png")).convert("RGBA"), target_w)
img2 = scale_to_width(Image.open(os.path.join(base_dir, "2.png")).convert("RGBA"), target_w)
img3 = scale_to_width(Image.open(os.path.join(base_dir, "3.jpg")).convert("RGBA"), target_w)
img4 = scale_to_width(Image.open(os.path.join(base_dir, "4.jpg")).convert("RGBA"), target_w)

grid_top_content_h = max(img1.height, img2.height) + vertical_img_gap + max(img3.height, img4.height)
required_mid_h = grid_top_content_h + y_padding_top + y_padding_bottom

b_img1 = scale_to_width(Image.open(os.path.join(base_dir, "6.png")).convert("RGBA"), target_w)
b_img2 = scale_to_width(Image.open(os.path.join(base_dir, "7.png")).convert("RGBA"), target_w)
b_img3 = scale_to_width(Image.open(os.path.join(base_dir, "8.png")).convert("RGBA"), target_w)
b_img4 = scale_to_width(Image.open(os.path.join(base_dir, "9.png")).convert("RGBA"), target_w)

grid_bot_content_h = max(b_img1.height, b_img2.height) + int(15*F) + max(b_img3.height, b_img4.height)
required_bot_tail_h = grid_bot_content_h + int(35*F) + int(35*F)

y_split_top = int(90 * F); y_split_mid = int(260 * F); y_split_bot_banner = int(370 * F)
top_img = tlo.crop((0, 0, tlo.width, y_split_top))
mid_img_adj = tlo.crop((0, y_split_top, tlo.width, y_split_mid)).resize((tlo.width, required_mid_h), Image.LANCZOS)
bot_banner_img = tlo.crop((0, y_split_mid, tlo.width, y_split_bot_banner))
bot_tail_img_adj = tlo.crop((0, y_split_bot_banner, tlo.width, tlo.height)).resize((tlo.width, required_bot_tail_h), Image.LANCZOS)

new_tlo = Image.new('RGB', (tlo.width, top_img.height + mid_img_adj.height + bot_banner_img.height + bot_tail_img_adj.height))
new_tlo.paste(top_img, (0, 0))
new_tlo.paste(mid_img_adj, (0, top_img.height))
new_tlo.paste(bot_banner_img, (0, top_img.height + mid_img_adj.height))
new_tlo.paste(bot_tail_img_adj, (0, top_img.height + mid_img_adj.height + bot_banner_img.height))

# FONT - try possible fonts that look like the original wide military stencil
# Bahnschrift or Agency B are wide and blocky
for fp in [r"C:\Windows\Fonts\AGENCYB.TTF", r"C:\Windows\Fonts\BRITANIC.TTF", r"C:\Windows\Fonts\impact.ttf"]:
    if os.path.exists(fp):
        font_path = fp
        break

# Banner native height = 75px. At F=4.5 = 337px
baner_h_native = baner_y2 - baner_y1   # 75 px
baner_h_scaled = int(baner_h_native * F)  # scaled

font_size = int(baner_h_scaled * 0.65)  # Font takes ~65% of banner height
font = ImageFont.truetype(font_path, size=font_size)

def draw_real_banner(text, center_y):
    # Measure text
    d_temp = ImageDraw.Draw(Image.new('RGB', (1,1)))
    bbox = d_temp.textbbox((0, 0), text, font=font)
    tw, th = bbox[2]-bbox[0], bbox[3]-bbox[1]
    
    # Build blank banner wider than text
    bw = tw + int(160 * F)
    bh = baner_h_scaled
    
    banner = build_empty_banner(bw, bh)
    d = ImageDraw.Draw(banner)
    
    # TEXT - black, bold centered
    tx, ty = (bw - tw) // 2, (bh - th) // 2 - int(5 * F)
    d.text((tx, ty), text, font=font, fill=(10, 10, 10))
    
    bx = (new_tlo.width - bw) // 2
    by = int(center_y - bh // 2)
    new_tlo.paste(banner, (bx, by))

total_w = target_w * 2 + grid_gap; start_x = (new_tlo.width - total_w) // 2
x_left = start_x; x_right = start_x + target_w + grid_gap
y_row1 = top_img.height + y_padding_top
y_row2 = y_row1 + max(img1.height, img2.height) + vertical_img_gap

draw_real_banner("SCREEN POCZ\u0104TKOWY", top_img.height + int(60 * F))
new_tlo.paste(img1, (x_left, y_row1), img1)
new_tlo.paste(img2, (x_right, y_row1), img2)

draw_real_banner("SCREEN KO\u0143COWY", y_row1 + max(img1.height, img2.height) + int(60 * F))
new_tlo.paste(img4, (x_left, y_row2), img4)
new_tlo.paste(img3, (x_right, y_row2), img3)

bot_grid_start_y = top_img.height + mid_img_adj.height + bot_banner_img.height + int(35 * F)
new_tlo.paste(b_img1, (x_left, bot_grid_start_y), b_img1)
new_tlo.paste(b_img2, (x_right, bot_grid_start_y), b_img2)
y_row4 = bot_grid_start_y + max(b_img1.height, b_img2.height) + int(15 * F)
new_tlo.paste(b_img3, (x_left, y_row4), b_img3)
new_tlo.paste(b_img4, (x_right, y_row4), b_img4)

new_tlo.save(out_path, quality=98, subsampling=0)
print(f"Zapisano w: {out_path}")
