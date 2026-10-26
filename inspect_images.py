from PIL import Image
import glob
import glob

files = glob.glob(r'C:\Users\Baver\Downloads\*.png') + glob.glob(r'C:\Users\Baver\Downloads\*.jpg')
files = [f for f in files if any(n in f for n in ['1.png', '2.png', '3.jpg', '4.jpg', 't\u0142o.jpg', 't\xb3o.jpg', 't\x88o.jpg', 'tlo.jpg']) and 'przyk' not in f]

for f in files:
    try:
        with Image.open(f) as img:
            print(f"{f}: {img.size}")
    except Exception as e:
        print(f"Error {f}: {e}")
