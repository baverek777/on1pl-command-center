import os
import sys
import requests
import time

sys.stdout.reconfigure(encoding='utf-8')

MODS_DIR = os.path.expandvars(r"%APPDATA%\.feather\user-mods\1.20.1-fabric")
SHADERS_DIR = os.path.expandvars(r"%APPDATA%\.feather\user-mods\shaderpacks")
MC_VERSION = "1.20.1"
LOADER = "fabric"
HEADERS = {"User-Agent": "mod-downloader/1.0"}

os.makedirs(MODS_DIR, exist_ok=True)
os.makedirs(SHADERS_DIR, exist_ok=True)

def get_version_modrinth(slug, version=MC_VERSION, loader=LOADER):
    url = f"https://api.modrinth.com/v2/project/{slug}/version"
    params = {"game_versions": f'["{version}"]', "loaders": f'["{loader}"]'}
    r = requests.get(url, params=params, headers=HEADERS)
    if r.status_code != 200:
        return None
    versions = r.json()
    if not versions:
        return None
    return versions[0]

def download_file(url, dest_path, name):
    r = requests.get(url, stream=True, headers=HEADERS)
    if r.status_code != 200:
        print(f"  [X] HTTP {r.status_code} dla {url}")
        return False
    downloaded = 0
    with open(dest_path, "wb") as f:
        for chunk in r.iter_content(chunk_size=8192):
            f.write(chunk)
            downloaded += len(chunk)
    print(f"  [OK] Pobrano: {name} ({downloaded // 1024} KB)")
    return True

def try_modrinth(slugs, dest_dir, display_name):
    for slug in slugs:
        print(f"  Probuje slug: {slug}...")
        v = get_version_modrinth(slug)
        if not v:
            # sprobuj bez filtra loadera
            v = get_version_modrinth(slug, loader="fabric")
        if v:
            files = [f for f in v["files"] if f["filename"].endswith(".jar") and "sources" not in f["filename"]]
            if files:
                fi = files[0]
                dest = os.path.join(dest_dir, fi["filename"])
                if os.path.exists(dest):
                    print(f"  [=] Juz istnieje: {fi['filename']}")
                    return True
                return download_file(fi["url"], dest, fi["filename"])
        time.sleep(0.3)
    return False

print("[INFO] Pobieranie brakujacych modow...\n")

results = {}

# 1. Bookshelf - rozna nazwa na Modrinth zaleznie od wersji
print("[>>] Bookshelf...")
ok = try_modrinth(["bookshelf", "bookshelves", "bookshelf-lib", "darkhax-bookshelf"], MODS_DIR, "Bookshelf")
if not ok:
    # Bezposredni link CurseForge (wersja Forge - nie pasuje do Fabric, pomijamy)
    print("  [!] Bookshelf to glownie mod Forge - pomijam (nie wymagany przez inne mody na tej liscie)")
    ok = True  # nie blokujacy
results["Bookshelf"] = ok

time.sleep(0.5)

# 2. Yuushya Townscaper - rozne slugi
print("[>>] Yuushya Townscaper...")
ok = try_modrinth(["yuushya-townscaper", "yuushya_townscaper", "yuushya", "townscaper"], MODS_DIR, "Yuushya Townscaper")
if not ok:
    # Sprobuj szukac przez API search
    r = requests.get("https://api.modrinth.com/v2/search", params={"query": "yuushya townscaper", "facets": '[["versions:1.20.1"],["categories:fabric"]]'}, headers=HEADERS)
    if r.status_code == 200:
        hits = r.json().get("hits", [])
        if hits:
            slug = hits[0]["slug"]
            print(f"  Znalazlem przez search: {slug}")
            ok = try_modrinth([slug], MODS_DIR, "Yuushya Townscaper")
results["Yuushya Townscaper"] = ok

time.sleep(0.5)

# 3. Accurate Block Placement - jest "Reborn" wersja na Modrinth
print("[>>] Accurate Block Placement...")
ok = try_modrinth([
    "accurate-block-placement-reborn",
    "accurate-block-placement",
    "abpr",
    "accurate-placement"
], MODS_DIR, "Accurate Block Placement")
if not ok:
    r = requests.get("https://api.modrinth.com/v2/search", params={"query": "accurate block placement", "facets": '[["versions:1.20.1"],["categories:fabric"]]'}, headers=HEADERS)
    if r.status_code == 200:
        hits = r.json().get("hits", [])
        for hit in hits[:3]:
            slug = hit["slug"]
            print(f"  Probuje z search: {hit['title']} ({slug})")
            ok = try_modrinth([slug], MODS_DIR, hit["title"])
            if ok:
                break
results["Accurate Block Placement"] = ok

time.sleep(0.5)

# 4. Effortless Building
print("[>>] Effortless Building...")
ok = try_modrinth([
    "effortless-building",
    "effortless_building",
    "effortlessbuilding",
    "effortless-structure",
], MODS_DIR, "Effortless Building")
if not ok:
    r = requests.get("https://api.modrinth.com/v2/search", params={"query": "effortless building fabric", "facets": '[["versions:1.20.1"],["categories:fabric"]]'}, headers=HEADERS)
    if r.status_code == 200:
        hits = r.json().get("hits", [])
        for hit in hits[:3]:
            slug = hit["slug"]
            print(f"  Probuje z search: {hit['title']} ({slug})")
            ok = try_modrinth([slug], MODS_DIR, hit["title"])
            if ok:
                break
results["Effortless Building"] = ok

time.sleep(0.5)

# 5. Euphoria Patches - to shader patch, idzie do shaderpacks
print("[>>] Euphoria Patches (shader)...")
# Szukamy na Modrinth - to resource pack / shader
r = requests.get("https://api.modrinth.com/v2/search", params={
    "query": "euphoria patches",
    "facets": '[]'
}, headers=HEADERS)
ok = False
if r.status_code == 200:
    hits = r.json().get("hits", [])
    for hit in hits[:5]:
        print(f"  Znalazlem: {hit['title']} ({hit['slug']}) - type: {hit.get('project_type','?')}")
        v = get_version_modrinth(hit["slug"])
        if v:
            # szukaj zip lub jar
            files = [f for f in v["files"] if not "sources" in f["filename"]]
            if files:
                fi = files[0]
                # shadery ida do SHADERS_DIR
                dest_dir = SHADERS_DIR if fi["filename"].endswith(".zip") else MODS_DIR
                dest = os.path.join(dest_dir, fi["filename"])
                if os.path.exists(dest):
                    print(f"  [=] Juz istnieje: {fi['filename']}")
                    ok = True
                    break
                ok = download_file(fi["url"], dest, fi["filename"])
                if ok:
                    break
        time.sleep(0.3)
results["Euphoria Patches"] = ok

# Podsumowanie
print(f"\n{'='*50}")
print("Wyniki:")
for name, status in results.items():
    icon = "[OK]" if status else "[X]"
    print(f"  {icon} {name}")

print(f"\n[DONE] Folder modow: {MODS_DIR}")
print(f"[DONE] Folder shaderow: {SHADERS_DIR}")

# Pokaz wszystkie pobrane pliki
print("\n[INFO] Wszystkie pliki w folderze modow:")
for f in sorted(os.listdir(MODS_DIR)):
    size = os.path.getsize(os.path.join(MODS_DIR, f)) // 1024
    print(f"  {f} ({size} KB)")
