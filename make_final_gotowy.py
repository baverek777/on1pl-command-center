from PIL import Image, ImageDraw, ImageFont
import os
import glob

base_dir = r"C:\Users\Baver\Downloads"
out_path = os.path.join(base_dir, "prawidlowy_wynik_GOTOWY.jpg")

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

# Crop real empty banner texture pieces (no text areas)
baner_y1, baner_y2 = 25, 100
left_piece  = tlo_orig.crop((200, baner_y1, 248, baner_y2))
right_piece = tlo_orig.crop((795, baner_y1, 840, baner_y2))

def build_empty_banner(target_width, target_height):
    banner = Image.new('RGB', (target_width, target_height))
    lp = left_piece.resize((left_piece.width, target_height), Image.LANCZOS)
    rp = right_piece.resize((right_piece.width, target_height), Image.LANCZOS)
    mid_w = target_width - lp.width - rp.width
    mid_col = lp.crop((lp.width - 2, 0, lp.width, target_height))
    mid_fill = mid_col.resize((mid_w, target_height), Image.LANCZOS)
    banner.paste(lp, (0, 0))
    banner.paste(mid_fill, (lp.width, 0))
    banner.paste(rp, (lp.width + mid_w, 0))
    return banner

# SCALE UP
F = 4.5
tlo = tlo_orig.resize((int(tlo_orig.width * F), int(tlo_orig.height * F)), Image.LANCZOS)

def scale_to_width(img, bw):
    return img.resize((bw, int(img.height * (bw / img.width))), Image.LANCZOS)

# Images top section
img1 = scale_to_width(Image.open(os.path.join(base_dir, "1.png")).convert("RGBA"), 1800)
img2 = scale_to_width(Image.open(os.path.join(base_dir, "2.png")).convert("RGBA"), 1800)
img3 = scale_to_width(Image.open(os.path.join(base_dir, "3.jpg")).convert("RGBA"), 1800)
img4 = scale_to_width(Image.open(os.path.join(base_dir, "4.jpg")).convert("RGBA"), 1800)

# Images bottom section
b_img1 = scale_to_width(Image.open(os.path.join(base_dir, "6.png")).convert("RGBA"), 1800)
b_img2 = scale_to_width(Image.open(os.path.join(base_dir, "7.png")).convert("RGBA"), 1800)
b_img3 = scale_to_width(Image.open(os.path.join(base_dir, "8.png")).convert("RGBA"), 1800)
b_img4 = scale_to_width(Image.open(os.path.join(base_dir, "9.png")).convert("RGBA"), 1800)

target_w = 1800
grid_gap = int(30 * F)
baner_h = int((baner_y2 - baner_y1) * F)  # native banner height scaled up
label_margin = int(20 * F)  # gap between banner and image

# HOW MUCH SPACE EACH SECTION NEEDS
# PRAWIDLOWY section:
# top padding + LABEL1 + margin + ROW1 + margin + LABEL2 + margin + ROW2 + bottom padding
top_pad   = int(35 * F)
bot_pad   = int(35 * F)

row1_h = max(img1.height, img2.height)
row2_h = max(img3.height, img4.height)

mid_h = top_pad + baner_h + label_margin + row1_h + label_margin + baner_h + label_margin + row2_h + bot_pad

# Bottom section (no labels needed)
row3_h = max(b_img1.height, b_img2.height)
row4_h = max(b_img3.height, b_img4.height)
bot_tail_h = int(35*F) + row3_h + int(15*F) + row4_h + int(35*F)

# Slice background
y_split_top        = int(90  * F)
y_split_mid        = int(260 * F)
y_split_bot_banner = int(370 * F)

top_img       = tlo.crop((0, 0,              tlo.width, y_split_top))
mid_src       = tlo.crop((0, y_split_top,    tlo.width, y_split_mid))
bot_banner    = tlo.crop((0, y_split_mid,    tlo.width, y_split_bot_banner))
bot_tail_src  = tlo.crop((0, y_split_bot_banner, tlo.width, tlo.height))

mid_img_adj      = mid_src.resize((tlo.width, mid_h), Image.LANCZOS)
bot_tail_img_adj = bot_tail_src.resize((tlo.width, bot_tail_h), Image.LANCZOS)

# Assemble
new_h = top_img.height + mid_img_adj.height + bot_banner.height + bot_tail_img_adj.height
new_tlo = Image.new('RGB', (tlo.width, new_h))
cy = 0
new_tlo.paste(top_img,       (0, cy)); cy += top_img.height
new_tlo.paste(mid_img_adj,   (0, cy)); cy += mid_img_adj.height
new_tlo.paste(bot_banner,    (0, cy)); cy += bot_banner.height
new_tlo.paste(bot_tail_img_adj, (0, cy))

# FONT
for fp in [r"C:\Windows\Fonts\AGENCYB.TTF", r"C:\Windows\Fonts\impact.ttf", r"C:\Windows\Fonts\arialbd.ttf"]:
    if os.path.exists(fp):
        font_path = fp
        break
font = ImageFont.truetype(font_path, size=int(baner_h * 0.65))

def paste_banner_label(text, banner_center_y):
    d_tmp = ImageDraw.Draw(Image.new('RGB', (1,1)))
    bbox = d_tmp.textbbox((0,0), text, font=font)
    tw, th = bbox[2]-bbox[0], bbox[3]-bbox[1]

    bw = tw + int(160 * F)
    bh = baner_h
    banner_img = build_empty_banner(bw, bh)
    d = ImageDraw.Draw(banner_img)
    d.text(((bw-tw)//2, (bh-th)//2 - int(5*F)), text, font=font, fill=(10,10,10))

    bx = (new_tlo.width - bw) // 2
    by = int(banner_center_y - bh // 2)
    new_tlo.paste(banner_img, (bx, by))

# CALCULATE Y POSITIONS within mid section
mid_start = top_img.height   # where mid camo section starts

label1_center = mid_start + top_pad + baner_h // 2
img_row1_y    = mid_start + top_pad + baner_h + label_margin
label2_center = img_row1_y + row1_h + label_margin + baner_h // 2
img_row2_y    = label2_center + baner_h // 2 + label_margin

# PASTE & DRAW TOP SECTION
x_left  = (new_tlo.width - (target_w*2 + grid_gap)) // 2
x_right = x_left + target_w + grid_gap

paste_banner_label("SCREEN POCZ\u0104TKOWY", label1_center)
new_tlo.paste(img1, (x_left,  img_row1_y), img1)
new_tlo.paste(img2, (x_right, img_row1_y), img2)
paste_banner_label("SCREEN KO\u0143COWY", label2_center)
new_tlo.paste(img4, (x_left,  img_row2_y), img4)
new_tlo.paste(img3, (x_right, img_row2_y), img3)

# PASTE BOTTOM SECTION (no labels)
bot_start = top_img.height + mid_img_adj.height + bot_banner.height + int(35*F)
new_tlo.paste(b_img1, (x_left,  bot_start), b_img1)
new_tlo.paste(b_img2, (x_right, bot_start), b_img2)
bot_row2_y = bot_start + row3_h + int(15*F)
new_tlo.paste(b_img3, (x_left,  bot_row2_y), b_img3)
new_tlo.paste(b_img4, (x_right, bot_row2_y), b_img4)

new_tlo.save(out_path, quality=98, subsampling=0)
print(f"Zapisano: {out_path}")
