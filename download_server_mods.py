import os
import sys
import requests
import time

sys.stdout.reconfigure(encoding='utf-8')

MODS_DIR = os.path.expandvars(r"%APPDATA%\.feather\user-mods\1.20.1-fabric")
HEADERS = {"User-Agent": "mod-downloader/1.0"}

def try_modrinth_search(query):
    r = requests.get("https://api.modrinth.com/v2/search", params={
        "query": query,
        "facets": '[["versions:1.20.1"],["categories:fabric"]]',
        "limit": 5
    }, headers=HEADERS)
    if r.status_code == 200:
        return r.json().get("hits", [])
    return []

def get_version(slug):
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
    r = requests.get(url, stream=True, headers=HEADERS)
    if r.status_code != 200:
        return False
    with open(dest_path, "wb") as f:
        for chunk in r.iter_content(chunk_size=8192):
            f.write(chunk)
    size = os.path.getsize(dest_path) // 1024
    print(f"  [OK] {name} ({size} KB)")
    return True

MODS = {
    "decocraft_nature": ["decocraft-nature", "decocraft_nature", "decocraft nature"],
    "reevesfurniture":  ["reevesfurniture", "reeves-furniture", "reeves furniture"],
    "skniro_furniture": ["skirnirs-furniture", "skniro-furniture", "skniro furniture", "skirnir furniture"],
}

print("[INFO] Szukam i pobierám 3 brakujace mody...\n")

for mod_id, queries in MODS.items():
    print(f"[>>] {mod_id}")
    found = False

    # Sprobuj wszystkie zapytania
    for q in queries:
        # Zacznij od direct slug
        v = get_version(q.replace(" ", "-"))
        if not v:
            # Szukaj przez search API
            hits = try_modrinth_search(q)
            for hit in hits:
                print(f"  Znalazlem przez search: {hit['title']} ({hit['slug']})")
                v = get_version(hit["slug"])
                if v:
                    break
        if v:
            files = [f for f in v["files"] if f["filename"].endswith(".jar") and "sources" not in f["filename"]]
            if files:
                fi = files[0]
                dest = os.path.join(MODS_DIR, fi["filename"])
                if os.path.exists(dest):
                    print(f"  [=] Juz istnieje: {fi['filename']}")
                    found = True
                else:
                    found = download_file(fi["url"], dest, fi["filename"])
                if found:
                    break
        time.sleep(0.3)

    if not found:
        print(f"  [!] Nie znaleziono na Modrinth - szukam na CurseForge...")
        # Proba przez CurseForge API (bez klucza - publiczne endpointy)
        cf_search = requests.get(
            "https://www.curseforge.com/api/v1/mods/search",
            params={"gameId": 432, "searchFilter": mod_id.replace("_", " "), "modLoaderType": 4, "gameVersion": "1.20.1"},
            headers={**HEADERS, "x-api-key": ""}
        )
        if not found:
            print(f"  [X] {mod_id} - niedostepny automatycznie, pobierz recznie")

print("\n[INFO] Wszystkie pliki w folderze modow:")
for f in sorted(os.listdir(MODS_DIR)):
    size = os.path.getsize(os.path.join(MODS_DIR, f)) // 1024
    print(f"  - {f} ({size} KB)")
print(f"\nLaczna liczba modow: {len(os.listdir(MODS_DIR))}")
