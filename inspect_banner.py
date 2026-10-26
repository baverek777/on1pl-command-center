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
print(f"Rozmiar oryginalnego tła: {tlo_orig.size}")

# Let's see where the banner exactly is - crop it
# Save the banner area for visual inspection
# The top banner "PRAWIDLOWY WYNIK" is around y=25..95 (in 1024x582 image)
banner_native = tlo_orig.crop((200, 25, 820, 100))
banner_native.save(os.path.join(base_dir, "baner_oryginalny.png"))
print(f"Zapisano baner_oryginalny.png")

# Also try a slightly wider crop
for y1 in [20, 25, 30]:
    for y2 in [90, 95, 100, 105]:
        crop = tlo_orig.crop((180, y1, 840, y2))
        crop.save(os.path.join(base_dir, f"baner_{y1}_{y2}.png"))
print("Zapisano próbki banera")
