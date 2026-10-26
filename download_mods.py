import os
import sys
sys.stdout.reconfigure(encoding='utf-8')
import requests
import time

MODS_DIR = os.path.expandvars(r"%APPDATA%\.feather\user-mods\1.20.1-fabric")
MC_VERSION = "1.20.1"
LOADER = "fabric"

os.makedirs(MODS_DIR, exist_ok=True)

# Modrinth slug -> nazwa wyświetlana
MODS = {
    "fabric-api":                   "Fabric API",
    "architectury-api":             "Architectury API",
    "cloth-config":                 "Cloth Config API",
    "geckolib":                     "GeckoLib",
    "corgilib":                     "CorgiLib",
    "terrablender":                 "TerraBlender",
    "bookshelf":                    "Bookshelf",
    "sodium":                       "Sodium",
    "iris":                         "Iris Shaders",
    "fps-reducer":                  "FPS Reducer",
    "mouse-tweaks":                 "Mouse Tweaks",
    "jei":                          "Just Enough Items",
    "macaws-furniture":             "Macaw's Furniture",
    "yuushya-townscaper":           "Yuushya Townscaper",
    "yuushya-modelling":            "Yuushya Modelling",
    "decocraft":                    "Decocraft",
    "accurate-block-placement":     "Accurate Block Placement",
    "effortless-building":          "Effortless Building",
    "oh-the-biomes-weve-gone":      "Oh The Biomes We've Gone",
    "oh-the-trees-youll-grow":      "Oh The Trees You'll Grow",
    "faunify":                      "Faunify",
    "simple-voice-chat":            "Simple Voice Chat",
    "euphoria-patcher":             "Euphoria Patches",
}

HEADERS = {"User-Agent": "mod-downloader/1.0"}

def get_version(slug):
    url = f"https://api.modrinth.com/v2/project/{slug}/version"
    params = {"game_versions": f'["{MC_VERSION}"]', "loaders": f'["{LOADER}"]'}
    r = requests.get(url, params=params, headers=HEADERS)
    if r.status_code != 200:
        return None
    versions = r.json()
    if not versions:
        return None
    return versions[0]  # najnowsza kompatybilna

def download_file(url, dest_path, name):
    r = requests.get(url, stream=True, headers=HEADERS)
    total = int(r.headers.get("content-length", 0))
    downloaded = 0
    with open(dest_path, "wb") as f:
        for chunk in r.iter_content(chunk_size=8192):
            f.write(chunk)
            downloaded += len(chunk)
    print(f"  [OK] Pobrano: {name} ({downloaded // 1024} KB)")

print(f"[INFO] Folder docelowy: {MODS_DIR}\n")
success = []
failed = []

for slug, display_name in MODS.items():
    print(f"[>>] Szukam: {display_name} ({slug})...")
    version = get_version(slug)
    if not version:
        print(f"  [X] Nie znaleziono dla MC {MC_VERSION} + {LOADER}")
        failed.append(display_name)
        time.sleep(0.3)
        continue

    # Znajdź plik .jar (nie source ani javadoc)
    files = [f for f in version["files"] if f["filename"].endswith(".jar") and "sources" not in f["filename"]]
    if not files:
        print(f"  [X] Brak pliku .jar")
        failed.append(display_name)
        continue

    file_info = files[0]
    filename = file_info["filename"]
    url = file_info["url"]
    dest = os.path.join(MODS_DIR, filename)

    if os.path.exists(dest):
        print(f"  [=] Juz istnieje: {filename}")
        success.append(display_name)
        time.sleep(0.2)
        continue

    download_file(url, dest, filename)
    success.append(display_name)
    time.sleep(0.5)  # żeby nie przeciążyć API

print(f"\n{'='*50}")
print(f"[OK] Pobrano pomyslnie ({len(success)}/{len(MODS)}):")
for m in success:
    print(f"   - {m}")

if failed:
    print(f"[X] Nie udalo sie pobrac ({len(failed)}):")
    for m in failed:
        print(f"   - {m}")

print(f"\n[DONE] Mody wrzucone do: {MODS_DIR}")
print("[START] Uruchom Feather Launcher i stworz profil 1.20.1 Fabric!")
