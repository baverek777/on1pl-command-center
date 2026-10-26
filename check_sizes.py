from PIL import Image
import os
import glob

base_dir = r"C:\Users\Baver\Downloads"
files = ["6.png", "7.png", "8.png", "9.png"]

for f in files:
    try:
        with Image.open(os.path.join(base_dir, f)) as img:
            print(f"{f}: {img.size}")
    except Exception as e:
        print(f"Error {f}: {e}")
