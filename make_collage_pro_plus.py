from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
import glob
import random

base_dir = r"C:\Users\Baver\Downloads"
out_path = os.path.join(base_dir, "prawidlowy_wynik_kolaz_ULTRA_PRO.jpg")

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

# SCALE UP
F = 4.5
tlo = tlo_orig.resize((int(tlo_orig.width * F), int(tlo_orig.height * F)), Image.LANCZOS)

# Create a more complex "Paper" banner texture
def create_war_thunder_banner(target_width, target_height):
    # Base off-white color with a hint of warmness
    banner = Image.new('RGB', (target_width, target_height), (225, 225, 225))
    d = ImageDraw.Draw(banner)
    
    # 1. Subtle Paper Texture (random gray dots)
    for _ in range(int(target_width * target_height * 0.1)):
        nx, ny = random.randint(0, target_width-1), random.randint(0, target_height-1)
        c = random.randint(210, 235)
        d.point((nx, ny), fill=(c, c, c))

    # 2. Ink Splatters (large black blobs)
    for _ in range(random.randint(15, 25)):
        sx, sy = random.randint(0, target_width-1), random.randint(0, target_height-1)
        s_base = random.randint(3, 8)
        # Random blobby shape
        for _ in range(3):
            off_x, off_y = random.randint(-4, 4), random.randint(-4, 4)
            d.ellipse([sx+off_x, sy+off_y, sx+off_x+s_base, sy+off_y+s_base], fill=(15, 15, 15))

    # 3. Rough Border (hand-drawn style)
    # We draw several lines slightly offset
    for i in range(3):
        d.rectangle([i, i, target_width-1-i, target_height-1-i], outline=(20, 20, 20), width=1)
    
    # Add random black "ticks" at edges
    for _ in range(30):
        side = random.choice(['t', 'b', 'l', 'r'])
        l_len = random.randint(4, 10)
        if side == 't': 
            x = random.randint(0, target_width-1)
            d.line([x, 0, x, l_len], fill=(10, 10, 10), width=2)
        elif side == 'b':
            x = random.randint(0, target_width-1)
            d.line([x, target_height-1, x, target_height-1-l_len], fill=(10, 10, 10), width=2)
            
    return banner

# Layout setup
target_w = int(1800)
grid_gap = int(30 * F)
y_padding_top = int(150 * F)
vertical_img_gap = int(150 * F)
y_padding_bottom = int(40 * F)

def scale_to_width(img, bw):
    bh = int(img.height * (bw / img.width))
    return img.resize((bw, bh), Image.LANCZOS)

# Images
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

grid_bot_content_h = max(b_img1.height, b_img2.height) + int(15 * F) + max(b_img3.height, b_img4.height)
required_bot_tail_h = grid_bot_content_h + int(35 * F) + int(35 * F)

# Reassemble
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

# FONT - Bahnschrift Bold is very square and heavy
font_path = r"C:\Windows\Fonts\bahnschrift.ttf" 
if not os.path.exists(font_path): font_path = r"C:\Windows\Fonts\impact.ttf"
# We'll use a slightly larger size and stretch it manually for that "heavy" look
font_size = int(48 * F)
font = ImageFont.truetype(font_path, size=font_size)

def draw_war_thunder_styled_banner(text, center_y):
    # 1. Draw text on separate layer to stretch it
    temp = Image.new('RGBA', (2000, 200), (0,0,0,0))
    td = ImageDraw.Draw(temp)
    bbox = td.textbbox((0, 0), text, font=font)
    tw, th = bbox[2]-bbox[0], bbox[3]-bbox[1]
    td.text((0, 0), text, font=font, fill=(5, 5, 5, 255))
    
    # Crop to text only
    text_img = temp.crop((0, 0, tw, th + 10))
    # STRETCH WIDTH by 10% to get that square look
    text_img = text_img.resize((int(text_img.width * 1.15), text_img.height), Image.LANCZOS)
    
    tw, th = text_img.width, text_img.height
    
    # 2. Create banner with matching style
    bw, bh = int(tw + 180 * F), int(90 * F)
    banner_bg = create_war_thunder_banner(bw, bh)
    
    # 3. Paste text on banner
    banner_bg.paste(text_img, ((bw-tw)//2, (bh-th)//2 - 10), text_img)
    
    # 4. Paste banner on collage
    bx, by = (new_tlo.width - bw) // 2, int(center_y - bh // 2)
    new_tlo.paste(banner_bg, (bx, by))

# COORDINATES
total_w = target_w * 2 + grid_gap; start_x = (new_tlo.width - total_w) // 2
x_left = start_x; x_right = start_x + target_w + grid_gap
y_row1 = top_img.height + y_padding_top
y_row2 = y_row1 + max(img1.height, img2.height) + vertical_img_gap

# APPLY
draw_war_thunder_styled_banner("SCREEN POCZ\u0104TKOWY", top_img.height + int(60 * F))
new_tlo.paste(img1, (x_left, y_row1), img1)
new_tlo.paste(img2, (x_right, y_row1), img2)

draw_war_thunder_styled_banner("SCREEN KO\u0143COWY", y_row1 + max(img1.height, img2.height) + int(60 * F))
new_tlo.paste(img4, (x_left, y_row2), img4)
new_tlo.paste(img3, (x_right, y_row2), img3)

# BOTTOM PASTE
bot_grid_start_y = top_img.height + mid_img_adj.height + bot_banner_img.height + int(35 * F)
new_tlo.paste(b_img1, (x_left, bot_grid_start_y), b_img1)
new_tlo.paste(b_img2, (x_right, bot_grid_start_y), b_img2)
y_row4 = bot_grid_start_y + max(b_img1.height, b_img2.height) + int(15 * F)
new_tlo.paste(b_img3, (x_left, y_row4), b_img3)
new_tlo.paste(b_img4, (x_right, y_row4), b_img4)

new_tlo.save(out_path, quality=98, subsampling=0)
print(f"Zapisano w: {out_path}")
