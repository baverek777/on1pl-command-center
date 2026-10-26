from PIL import Image, ImageDraw, ImageFont, ImageStat
import os
import glob
import random

base_dir = r"C:\Users\Baver\Downloads"
out_path = os.path.join(base_dir, "prawidlowy_wynik_kolaz_FINAL_ULTIMATE.jpg")

tlo_candidates = glob.glob(os.path.join(base_dir, "t*o.jpg")) + glob.glob(os.path.join(base_dir, "t*o.png"))
tlo_file = None
for f in tlo_candidates:
    if "t" in os.path.basename(f).lower() and "o" in os.path.basename(f).lower():
        tlo_file = f
        break

tlo_orig = Image.open(tlo_file).convert("RGB")

# BANNER SAMPLES FROM NATIVE
# Banner is around y=30 to 100 in a 1024x582 image
banner_slice = tlo_orig.crop((245, 30, 775, 100)) 

def create_ultra_authentic_banner(target_width, target_height):
    # Base grey color + noise
    banner = Image.new('RGB', (target_width, target_height), (210, 210, 210))
    d = ImageDraw.Draw(banner)
    
    # Add fake distressing
    for _ in range(int(target_width * target_height * 0.005)):
        nx = random.randint(0, target_width-1)
        ny = random.randint(0, target_height-1)
        c = random.randint(180, 200)
        d.point((nx, ny), fill=(c, c, c))
    
    # Add black splatters (ink spots) like in the screenshot
    for _ in range(random.randint(5, 12)):
        sx = random.randint(0, target_width-1)
        sy = random.randint(0, target_height-1)
        s_size = random.randint(2, 6)
        d.ellipse([sx, sy, sx+s_size, sy+s_size], fill=(20, 20, 20))

    # Add black border
    d.rectangle([0, 0, target_width-1, target_height-1], outline=(30, 30, 30), width=3)
    
    # Add the "shattered" or "torn" edges look by cropping corners slightly or adding tiny random black triangles
    return banner

# REMOVE LOGO
patch_size = 120
patch = tlo_orig.crop((10, tlo_orig.height - patch_size - 10, 10 + patch_size, tlo_orig.height - 10))
tlo_orig.paste(patch, (tlo_orig.width - patch_size - 5, tlo_orig.height - patch_size - 5))
tlo_orig.paste(patch, (tlo_orig.width - patch_size, tlo_orig.height - patch_size))

# SCALE UP
F = 4.5
tlo = tlo_orig.resize((int(tlo_orig.width * F), int(tlo_orig.height * F)), Image.LANCZOS)

# Grid setup
target_w = int(1800)
grid_gap = int(30 * F)
y_padding_top = int(140 * F) 
vertical_img_gap = int(140 * F)
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
curr_y = 0
new_tlo.paste(top_img, (0, curr_y)); curr_y += top_img.height
new_tlo.paste(mid_img_adj, (0, curr_y)); curr_y += mid_img_adj.height
new_tlo.paste(bot_banner_img, (0, curr_y)); curr_y += bot_banner_img.height
new_tlo.paste(bot_tail_img_adj, (0, curr_y))

# FONT - Agency FB is very blocky
font_path = r"C:\Windows\Fonts\AGENCYB.TTF" 
if not os.path.exists(font_path): font_path = r"C:\Windows\Fonts\impact.ttf"
font = ImageFont.truetype(font_path, size=int(50 * F))

def draw_final_banner(text, center_y):
    # Measure text
    draw_temp = ImageDraw.Draw(Image.new('RGB', (1, 1)))
    bbox = draw_temp.textbbox((0, 0), text, font=font)
    tw, th = bbox[2]-bbox[0], bbox[3]-bbox[1]
    
    bw, bh = int(tw + 150 * F), int(85 * F)
    banner_bg = create_ultra_authentic_banner(bw, bh)
    
    d = ImageDraw.Draw(banner_bg)
    # The font in screenshot has tiny pixelated gaps. Agency Bold is close.
    # Color is #050505
    d.text(((bw-tw)//2, (bh-th)//2 - 8*F), text, font=font, fill="#050505")
    
    bx, by = (new_tlo.width - bw) // 2, int(center_y - bh // 2)
    new_tlo.paste(banner_bg, (bx, by))

total_w = target_w * 2 + grid_gap; start_x = (new_tlo.width - total_w) // 2
x_left = start_x; x_right = start_x + target_w + grid_gap
y_row1 = top_img.height + y_padding_top
y_row2 = y_row1 + max(img1.height, img2.height) + vertical_img_gap

# TOP LABELS WITH AUTHENTIC STYLE
draw_final_banner("SCREEN POCZ\u0104TKOWY", top_img.height + int(50 * F))
new_tlo.paste(img1, (x_left, y_row1), img1)
new_tlo.paste(img2, (x_right, y_row1), img2)

draw_final_banner("SCREEN KO\u0143COWY", y_row1 + max(img1.height, img2.height) + int(50 * F))
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
