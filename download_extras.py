import os
import sys
import requests
import time

sys.stdout.reconfigure(encoding='utf-8')

MODS_DIR        = os.path.expandvars(r"%APPDATA%\.minecraft\mods")
SHADERS_DIR     = os.path.expandvars(r"%APPDATA%\.minecraft\shaderpacks")
RESOURCES_DIR   = os.path.expandvars(r"%APPDATA%\.minecraft\resourcepacks")
FEATHER_MODS    = os.path.expandvars(r"%APPDATA%\.feather\user-mods\1.20.1-fabric")

for d in [MODS_DIR, SHADERS_DIR, RESOURCES_DIR]:
    os.makedirs(d, exist_ok=True)

HEADERS = {"User-Agent": "mod-downloader/1.0"}

def get_version_modrinth(slug):
    url = f"https://api.modrinth.com/v2/project/{slug}/version"
    params = {"game_versions": '["1.20.1"]', "loaders": '["fabric"]'}
    r = requests.get(url, params=params, headers=HEADERS)
    if r.status_code == 200 and r.json():
        return r.json()[0]
    # bez filtra loadera
    r2 = requests.get(url, params={"game_versions": '["1.20.1"]'}, headers=HEADERS)
    if r2.status_code == 200 and r2.json():
        return r2.json()[0]
    return None

def download_file(url, dest_path, name):
    print(f"  Pobieram: {name}...")
    r = requests.get(url, stream=True, headers=HEADERS)
    if r.status_code != 200:
        print(f"  [X] HTTP {r.status_code}")
        return False
    with open(dest_path, "wb") as f:
        for chunk in r.iter_content(chunk_size=65536):
            f.write(chunk)
    size = os.path.getsize(dest_path) // 1024
    print(f"  [OK] {name} ({size} KB)")
    return True

def download_mod(slug, dest_dir, display_name):
    print(f"[>>] {display_name}...")
    v = get_version_modrinth(slug)
    if not v:
        print(f"  [X] Nie znaleziono na Modrinth")
        return False
    files = [f for f in v["files"] if not "sources" in f["filename"]]
    if not files:
        return False
    fi = files[0]
    dest = os.path.join(dest_dir, fi["filename"])
    if os.path.exists(dest):
        print(f"  [=] Juz istnieje: {fi['filename']}")
        return True
    return download_file(fi["url"], dest, fi["filename"])

print("=" * 55)
print("Pobieranie brakujacych plikow...")
print("=" * 55)

# 1. Complementary Shaders r5.7.x - wymagane przez EuphoriaPatcher
print("\n[1] Complementary Shaders r5.7.1 (wymagane przez EuphoriaPatcher)")
comp_url = "https://cdn.modrinth.com/data/HVnmMxH1/versions/lTobO9hR/ComplementaryShaders_r5.7.1.zip"
comp_dest = os.path.join(SHADERS_DIR, "ComplementaryShaders_r5.7.1.zip")
if os.path.exists(comp_dest):
    print("  [=] Juz istnieje")
else:
    # Sprobuj przez Modrinth API
    v = get_version_modrinth("complementary-shaders")
    if v:
        files = [f for f in v["files"] if f["filename"].endswith(".zip")]
        if files:
            fi = files[0]
            download_file(fi["url"], os.path.join(SHADERS_DIR, fi["filename"]), fi["filename"])
        else:
            download_file(comp_url, comp_dest, "ComplementaryShaders_r5.7.1.zip")
    else:
        download_file(comp_url, comp_dest, "ComplementaryShaders_r5.7.1.zip")

time.sleep(0.5)

# 2. Indium (wymagany przez Yuushya Modelling + Sodium + Continuity)
print("\n[2] Indium")
download_mod("indium", FEATHER_MODS, "Indium")
time.sleep(0.5)

# 3. Continuity (connected textures)
print("\n[3] Continuity")
download_mod("continuity", FEATHER_MODS, "Continuity")
time.sleep(0.5)

# 4. Yuushya 16x Resource Pack
print("\n[4] Yuushya 16x Resource Pack (szukam na Modrinth)...")
v = get_version_modrinth("yuushya-16x")
if not v:
    # szukaj przez search
    r = requests.get("https://api.modrinth.com/v2/search", params={
        "query": "yuushya 16x resource pack",
        "facets": '[["project_type:resourcepack"]]',
        "limit": 5
    }, headers=HEADERS)
    if r.status_code == 200:
        hits = r.json().get("hits", [])
        for hit in hits:
            print(f"  Znalazlem: {hit['title']} ({hit['slug']})")
            v = get_version_modrinth(hit["slug"])
            if v:
                break
if v:
    files = [f for f in v["files"] if not "sources" in f["filename"]]
    if files:
        fi = files[0]
        dest = os.path.join(RESOURCES_DIR, fi["filename"])
        if not os.path.exists(dest):
            download_file(fi["url"], dest, fi["filename"])
        else:
            print(f"  [=] Juz istnieje: {fi['filename']}")
else:
    print("  [!] Yuushya 16x - pobierz recznie z: https://yuushya.com lub Modrinth")

time.sleep(0.5)

# 5. Yuushya Foliage Addon
print("\n[5] Yuushya Foliage Addon (szukam na Modrinth)...")
for slug in ["yuushya-foliage", "yuushya-foliage-addon"]:
    v = get_version_modrinth(slug)
    if v:
        break
if not v:
    r = requests.get("https://api.modrinth.com/v2/search", params={
        "query": "yuushya foliage",
        "limit": 5
    }, headers=HEADERS)
    if r.status_code == 200:
        hits = r.json().get("hits", [])
        for hit in hits:
            print(f"  Znalazlem: {hit['title']} ({hit['slug']})")
            v = get_version_modrinth(hit["slug"])
            if v:
                break
if v:
    files = [f for f in v["files"] if not "sources" in f["filename"]]
    if files:
        fi = files[0]
        dest = os.path.join(RESOURCES_DIR, fi["filename"])
        if not os.path.exists(dest):
            download_file(fi["url"], dest, fi["filename"])
        else:
            print(f"  [=] Juz istnieje: {fi['filename']}")
else:
    print("  [!] Yuushya Foliage Addon - pobierz recznie z: https://yuushya.com")

print("\n" + "=" * 55)
print("PODSUMOWANIE:")
print(f"Mody ({FEATHER_MODS}):")
for f in sorted(os.listdir(FEATHER_MODS)):
    print(f"  + {f}")
print(f"\nShaderpacks ({SHADERS_DIR}):")
for f in sorted(os.listdir(SHADERS_DIR)):
    print(f"  + {f}")
print(f"\nResource Packs ({RESOURCES_DIR}):")
for f in sorted(os.listdir(RESOURCES_DIR)):
    print(f"  + {f}")
