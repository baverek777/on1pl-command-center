import os
import sys
import json
import datetime
import re
import urllib.request
import urllib.parse
import webbrowser
import subprocess
import pandas as pd
import streamlit as st

# ---------------------------------------------------------------------------
# PAGE CONFIGURATION — CLAUDE DESKTOP STYLE
# ---------------------------------------------------------------------------
st.set_page_config(
    page_title="Claude · Antigravity Agent",
    page_icon="✳️",
    layout="wide",
    initial_sidebar_state="expanded",
)

st.markdown("""
<style>
    /* Dark Theme Base */
    .stApp {
        background-color: #18181b;
        color: #e4e4e7;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    
    /* Clean, Sleek Sidebar */
    [data-testid="stSidebar"] {
        background-color: #121214 !important;
        border-right: 1px solid #27272a;
        min-width: 270px;
        max-width: 320px;
    }
    [data-testid="stSidebar"] .block-container {
        padding: 0.8rem 0.5rem;
    }
    
    /* Eliminate bulky Streamlit buttons in Sidebar - make them native flat items */
    [data-testid="stSidebar"] button {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        text-align: left !important;
        justify-content: flex-start !important;
        padding: 6px 10px !important;
        margin: 1px 0 !important;
        color: #a1a1aa !important;
        font-size: 0.88rem !important;
        border-radius: 6px !important;
        width: 100% !important;
        transition: all 0.15s ease !important;
    }
    [data-testid="stSidebar"] button:hover {
        background: #27272a !important;
        color: #f4f4f5 !important;
    }
    [data-testid="stSidebar"] button:active, [data-testid="stSidebar"] button:focus {
        background: #27272a !important;
        color: #ffffff !important;
    }
    [data-testid="stSidebar"] button[kind="primary"] {
        background: #27272a !important;
        border: 1px solid #3f3f46 !important;
        color: #f4f4f5 !important;
        font-weight: 500 !important;
    }
    [data-testid="stSidebar"] button[kind="primary"]:hover {
        background: #3f3f46 !important;
        border-color: #52525b !important;
    }
    
    /* Clean Tree Navigation */
    .tree-folder {
        color: #d4d4d8;
        font-size: 0.88rem;
        font-weight: 500;
        padding: 4px 6px;
        margin-top: 4px;
        display: flex;
        align-items: center;
        gap: 6px;
    }
    .tree-item {
        color: #a1a1aa;
        font-size: 0.84rem;
        padding: 3px 8px 3px 22px;
        border-radius: 4px;
        cursor: pointer;
    }
    .tree-item:hover {
        background: #27272a;
        color: #f4f4f5;
    }
    
    /* Claude Greeting Asterisk */
    .claude-asterisk {
        color: #d97706;
        font-size: 2.3rem;
        margin-right: 8px;
        display: inline-block;
        vertical-align: middle;
    }
    .claude-greeting {
        font-size: 2.1rem;
        font-weight: 400;
        letter-spacing: -0.5px;
        color: #f4f4f5;
        font-family: Georgia, serif, -apple-system;
    }
    
    /* Antigravity Badge */
    .antigravity-badge {
        background: #1e1b4b;
        color: #a5b4fc;
        border: 1px solid #3730a3;
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 0.82rem;
        font-weight: 500;
        margin: 4px 0;
        display: inline-block;
    }
    
    /* Custom Card */
    .custom-card {
        background: #1f1f23;
        border: 1px solid #2e2e33;
        border-radius: 10px;
        padding: 1rem;
        margin: 0.5rem 0;
    }
    
    /* Mobile / Container adjust */
    .block-container {
        padding: 1.2rem 2.2rem;
        max-width: 1200px;
    }
</style>
""", unsafe_allow_html=True)

# ---------------------------------------------------------------------------
# PATHS & STORAGE
# ---------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECTS_DIR = os.path.join(BASE_DIR, "projects")
ARTIFACTS_DIR = os.path.join(BASE_DIR, "artifacts")
CONFIG_FILE = os.path.join(BASE_DIR, "config.json")
FOLDERS_FILE = os.path.join(BASE_DIR, "folders.json")
SHEET_CACHE_FILE = os.path.join(BASE_DIR, "sheet_cache.csv")

for d in [PROJECTS_DIR, ARTIFACTS_DIR]:
    os.makedirs(d, exist_ok=True)

DEFAULT_SHEET_URL = "https://docs.google.com/spreadsheets/d/1KcHjmev34Xtp9oxnQJTHVaU2acvkaYY_kAGelEX_Nuo/edit?gid=1458623191#gid=1458623191"

# ---------------------------------------------------------------------------
# HELPERS
# ---------------------------------------------------------------------------

def load_json(path, default=None):
    if default is None:
        default = {}
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return default
    return default


def save_json(path, data):
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def get_config():
    cfg = load_json(CONFIG_FILE, {})
    if "key_gemini" not in cfg:
        cfg["key_gemini"] = ""
    if "model" not in cfg:
        cfg["model"] = "gemini-3.5-flash"
    if "sheet_url" not in cfg:
        cfg["sheet_url"] = DEFAULT_SHEET_URL
    if "hook_auto_exec" not in cfg:
        cfg["hook_auto_exec"] = True
    return cfg


def save_config(cfg):
    save_json(CONFIG_FILE, cfg)


# ---------------------------------------------------------------------------
# DYNAMIC FOLDERS & PROJECTS
# ---------------------------------------------------------------------------
def get_user_folders():
    defaults = [
        {
            "id": "serwer_discord",
            "name": "Serwer Discord",
            "icon": "📁",
            "items": ["ON1PL Akta", "ON1PL Tiktok", "ON1PL Ogłoszenia", "ON1PL Discord"]
        }
    ]
    return load_json(FOLDERS_FILE, defaults)


def save_user_folders(folders):
    save_json(FOLDERS_FILE, folders)


# ---------------------------------------------------------------------------
# ANTIGRAVITY AGENT ENGINE (BROWSER, CLI, WEB, FILES)
# ---------------------------------------------------------------------------
def agent_execute_action(action_type, payload):
    """Wykonuje autonomiczne akcje agenta Antigravity na komputerze użytkownika."""
    try:
        # 1. Otwieranie przeglądarki na pulpicie
        if action_type == "OPEN_BROWSER":
            url = payload.strip()
            webbrowser.open(url)
            return f"🌐 Otwarto stronę w Twojej przeglądarce: {url}"

        # 2. Pobieranie / czytanie zawartości strony www
        elif action_type == "BROWSE":
            url = payload.strip()
            if "tiktok.com" in url:
                import yt_dlp
                ydl_opts = {'quiet': True, 'skip_download': True, 'no_warnings': True}
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(url, download=False)
                    desc = info.get("description", "") or info.get("title", "")
                    uploader = info.get("uploader", "Nieznany")
                    views = info.get("view_count", 0)
                    likes = info.get("like_count", 0)
                    return f"[TikTok @{uploader} | {views:,} views | {likes:,} likes]: {desc}"
            else:
                req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
                with urllib.request.urlopen(req, timeout=5) as resp:
                    html = resp.read().decode("utf-8", errors="ignore")
                    clean = re.sub(r'<[^>]+>', ' ', html)[:2000]
                    clean = re.sub(r'\s+', ' ', clean)
                    return f"[Strona {url}]: {clean}"

        # 3. Wyszukiwanie w internecie
        elif action_type == "SEARCH":
            query = payload.strip()
            url = "https://html.duckduckgo.com/html/?q=" + urllib.parse.quote(query)
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
            with urllib.request.urlopen(req, timeout=5) as r:
                html = r.read().decode("utf-8", errors="ignore")
            snippets = re.findall(r'<a class="result__snippet"[^>]*>([\s\S]*?)</a>', html)
            clean_snips = [re.sub(r'<[^>]+>', '', s).strip() for s in snippets[:3]]
            return "\n".join([f"• {s}" for s in clean_snips]) if clean_snips else "Brak bezpośrednich wyników."

        # 4. Wykonywanie komend systemowych (PowerShell / CLI)
        elif action_type == "EXEC":
            cmd = payload.strip()
            res = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30, cwd=BASE_DIR)
            out = res.stdout or ""
            if res.stderr:
                out += f"\n[STDERR] {res.stderr}"
            return out.strip() or "✅ Wykonano pomyślnie."

        # 5. Zapisywanie pliku
        elif action_type == "WRITE_FILE":
            # format: path ::: content
            if ":::" in payload:
                fpath, content = payload.split(":::", 1)
                target = os.path.join(BASE_DIR, fpath.strip())
                os.makedirs(os.path.dirname(target), exist_ok=True)
                with open(target, "w", encoding="utf-8") as f:
                    f.write(content.strip())
                return f"💾 Zapisano plik: {fpath.strip()}"
            return "Błąd formatu WRITE_FILE"

        # 6. Odczyt pliku
        elif action_type == "READ_FILE":
            target = os.path.join(BASE_DIR, payload.strip())
            if os.path.exists(target):
                with open(target, "r", encoding="utf-8") as f:
                    return f.read()[:3000]
            return f"❌ Nie znaleziono pliku: {payload.strip()}"

    except Exception as e:
        return f"❌ Błąd akcji {action_type}: {e}"
    return "Nieznana akcja"


def parse_and_run_agent_actions(text):
    """Wykrywa tagi akcji agenta Antigravity w odpowiedzi AI i je uruchamia."""
    results = []

    # [OPEN_BROWSER: url]
    for url in re.findall(r'\[OPEN_BROWSER:\s*(.*?)\]', text):
        res = agent_execute_action("OPEN_BROWSER", url)
        results.append({"type": "🌐 Przeglądarka", "action": f"Otwarto: {url}", "result": res})

    # [BROWSE: url]
    for url in re.findall(r'\[BROWSE:\s*(.*?)\]', text):
        res = agent_execute_action("BROWSE", url)
        results.append({"type": "🔍 Przeglądanie strony", "action": url, "result": res})

    # [SEARCH: query]
    for q in re.findall(r'\[SEARCH:\s*(.*?)\]', text):
        res = agent_execute_action("SEARCH", q)
        results.append({"type": "🔎 Szukanie w sieci", "action": q, "result": res})

    # [EXEC] cmd [/EXEC]
    for cmd in re.findall(r'\[EXEC\]\s*([\s\S]*?)\s*\[/EXEC\]', text):
        res = agent_execute_action("EXEC", cmd)
        results.append({"type": "⚡ Terminal (Hook Layer)", "action": cmd, "result": res})

    # [WRITE_FILE: path] content [/WRITE_FILE]
    for path, content in re.findall(r'\[WRITE_FILE:\s*(.*?)\]\s*([\s\S]*?)\s*\[/WRITE_FILE\]', text):
        res = agent_execute_action("WRITE_FILE", f"{path}:::{content}")
        results.append({"type": "💾 Zapis pliku", "action": path, "result": res})

    return results


# ---------------------------------------------------------------------------
# ARTIFACTS PARSER
# ---------------------------------------------------------------------------
def parse_and_save_artifacts(response_text, project_name="Ogólny"):
    pattern = r"```(html|python|markdown|csv|json)?\s*\n([\s\S]*?)```"
    matches = re.findall(pattern, response_text)
    saved = []
    for lang, content in matches:
        if len(content.strip()) > 60:
            aid = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            atype = "code" if lang in ["python", "json"] else ("design" if lang == "html" else "docs")
            title = f"{project_name} — {lang.upper() or 'Text'} ({aid[-4:]})"
            artifact_file = os.path.join(ARTIFACTS_DIR, f"{aid}.json")
            save_json(artifact_file, {
                "id": aid,
                "title": title,
                "type": atype,
                "language": lang or "text",
                "content": content.strip(),
                "project": project_name,
                "created": datetime.datetime.now().isoformat(),
            })
            saved.append(aid)
    return saved


# ---------------------------------------------------------------------------
# LLM ENGINE (GEMINI REST)
# ---------------------------------------------------------------------------
def generate_ai_response(prompt, system_instruction, api_key, model_name="gemini-3.5-flash", stream_box=None):
    if not api_key:
        return "❌ Brak klucza API! Skonfiguruj klucz w zakładce Customize ⚙️"
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "systemInstruction": {"parts": [{"text": system_instruction}]},
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 4096}
    }
    
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            
        candidates = data.get("candidates", [])
        if candidates and "content" in candidates[0]:
            parts = candidates[0]["content"].get("parts", [])
            text = "".join([p.get("text", "") for p in parts])
            if stream_box:
                stream_box.markdown(text)
            return text
        else:
            return "❌ Model nie zwrócił odpowiedzi."
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        if "404" in str(e) and model_name != "gemini-3.1-flash-lite":
            return generate_ai_response(prompt, system_instruction, api_key, "gemini-3.1-flash-lite", stream_box)
        return f"❌ Błąd API ({e.code}): {err_body[:200]}"
    except Exception as e:
        return f"❌ Błąd połączenia: {e}"


# ---------------------------------------------------------------------------
# SESSION STATE INITIALIZATION
# ---------------------------------------------------------------------------
cfg = get_config()

if "current_view" not in st.session_state:
    st.session_state.current_view = "home"
if "active_project" not in st.session_state:
    st.session_state.active_project = None
if "current_chat_id" not in st.session_state:
    st.session_state.current_chat_id = None
if "chat_messages" not in st.session_state:
    st.session_state.chat_messages = []
if "show_new_folder_modal" not in st.session_state:
    st.session_state.show_new_folder_modal = False

# ---------------------------------------------------------------------------
# SIDEBAR — EXACT CLAUDE DESKTOP FLAT NAVIGATION
# ---------------------------------------------------------------------------
with st.sidebar:
    # 1. New Chat button
    if st.button("➕ Nowy czat", use_container_width=True, type="primary"):
        st.session_state.current_view = "home"
        st.session_state.current_chat_id = None
        st.session_state.chat_messages = []
        st.rerun()

    st.markdown("<div style='height: 4px;'></div>", unsafe_allow_html=True)

    # 2. Main Nav Items
    nav_cols = st.columns(4)
    with nav_cols[0]:
        if st.button("🔍 Szukaj", use_container_width=True):
            st.session_state.current_view = "search"
            st.rerun()
    with nav_cols[1]:
        if st.button("📁 Projekty", use_container_width=True):
            st.session_state.current_view = "projects"
            st.rerun()
    with nav_cols[2]:
        if st.button("📑 Artefakty", use_container_width=True):
            st.session_state.current_view = "artifacts"
            st.rerun()
    with nav_cols[3]:
        if st.button("⚙️ Wtyczki", use_container_width=True):
            st.session_state.current_view = "customize"
            st.rerun()

    st.markdown("---")

    # 3. Dynamic Folders & Pinned Tree (Clean, native flat list)
    col_pin_hdr, col_pin_add = st.columns([4, 1])
    with col_pin_hdr:
        st.caption("📌 PRZYPIĘTE FOLDERY")
    with col_pin_add:
        if st.button("➕", help="Utwórz nowy folder / grupę"):
            st.session_state.show_new_folder_modal = not st.session_state.show_new_folder_modal
            st.rerun()

    # Form to add custom folder if toggled
    if st.session_state.show_new_folder_modal:
        st.markdown("<div style='background:#1f1f23;padding:8px;border-radius:6px;margin-bottom:8px;'>", unsafe_allow_html=True)
        new_f_name = st.text_input("Nazwa folderu", placeholder="np. SQB Turnieje", label_visibility="collapsed")
        c_add, c_cancel = st.columns(2)
        with c_add:
            if st.button("Dodaj", type="primary") and new_f_name:
                folders = get_user_folders()
                safe_id = re.sub(r'[^\w\s-]', '', new_f_name).strip().replace(' ', '_').lower()
                folders.append({"id": safe_id, "name": new_f_name, "icon": "📁", "items": []})
                save_user_folders(folders)
                st.session_state.show_new_folder_modal = False
                st.rerun()
        with c_cancel:
            if st.button("Anuluj"):
                st.session_state.show_new_folder_modal = False
                st.rerun()
        st.markdown("</div>", unsafe_allow_html=True)

    # Render User Folders without bulky borders
    user_folders = get_user_folders()
    for f_idx, folder in enumerate(user_folders):
        f_name = folder.get("name", "Folder")
        f_items = folder.get("items", [])
        
        # Folder Header
        col_f_name, col_f_del = st.columns([5, 1])
        with col_f_name:
            st.markdown(f"<div class='tree-folder'>{folder.get('icon', '📁')} {f_name}</div>", unsafe_allow_html=True)
        with col_f_del:
            if st.button("×", key=f"delf_{f_idx}", help="Usuń folder"):
                user_folders.pop(f_idx)
                save_user_folders(user_folders)
                st.rerun()

        # Folder Sub-items
        for item in f_items:
            if st.button(f"  • {item}", key=f"fitem_{f_name}_{item}", use_container_width=True):
                safe = re.sub(r'[^\w\s-]', '', item).strip().replace(' ', '_')
                pdir = os.path.join(PROJECTS_DIR, safe)
                st.session_state.active_project = pdir
                st.session_state.current_chat_id = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
                st.session_state.chat_messages = []
                st.session_state.current_view = "chat"
                st.rerun()

    st.markdown("---")

    # 4. Recent Chats
    st.caption("💬 OSTATNIE CZATY")
    all_recent = []
    if os.path.exists(PROJECTS_DIR):
        for pd_item in os.listdir(PROJECTS_DIR):
            cdir = os.path.join(PROJECTS_DIR, pd_item, "chats")
            if os.path.exists(cdir):
                for cf in os.listdir(cdir):
                    if cf.endswith(".json"):
                        cinfo = load_json(os.path.join(cdir, cf), {})
                        all_recent.append({
                            "file": cf,
                            "pdir": os.path.join(PROJECTS_DIR, pd_item),
                            "title": cinfo.get("title", "Czat"),
                            "date": cinfo.get("date", ""),
                        })
    all_recent.sort(key=lambda x: x["date"], reverse=True)

    for item in all_recent[:5]:
        if st.button(f"💭 {item['title'][:20]}", key=f"rc_{item['file']}", use_container_width=True):
            st.session_state.active_project = item["pdir"]
            cdata = load_json(os.path.join(item["pdir"], "chats", item["file"]), {})
            st.session_state.chat_messages = cdata.get("messages", [])
            st.session_state.current_chat_id = item["file"].replace(".json", "")
            st.session_state.current_view = "chat"
            st.rerun()

    st.markdown("<div style='height: 20px;'></div>", unsafe_allow_html=True)
    st.markdown("---")

    # Public Tunnel link
    tunnel_url = cfg.get("public_tunnel_url", "")
    if tunnel_url:
        st.caption("🌐 PUBLICZNY LINK HTTPS:")
        st.markdown(f"[{tunnel_url}]({tunnel_url})")

    st.markdown("**Commander** · <span style='color:#10b981;font-size:0.8rem;'>Free / Uncapped</span>", unsafe_allow_html=True)


# ---------------------------------------------------------------------------
# VIEW 1: HOME (CLAUDE + ANTIGRAVITY HUB)
# ---------------------------------------------------------------------------
if st.session_state.current_view == "home":
    st.markdown("<div style='height: 35px;'></div>", unsafe_allow_html=True)
    
    st.markdown("""
    <div style='text-align: center; margin-bottom: 25px;'>
        <span class='claude-asterisk'>✳</span>
        <span class='claude-greeting'>Good afternoon, Commander</span>
        <div style='color: #71717a; font-size: 0.95rem; margin-top: 6px;'>
            Claude Desktop + Antigravity Agent · Dostęp do przeglądarki, terminala i automatyzacji
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    input_col1, input_col2, input_col3 = st.columns([1, 8, 1])
    with input_col2:
        user_prompt = st.chat_input("How can I help you today? / W czym mogę Ci dzisiaj pomóc?")
        
        st.markdown("<div style='height: 10px;'></div>", unsafe_allow_html=True)
        pill_cols = st.columns(6)
        
        with pill_cols[0]:
            if st.button("✍️ Pisz", use_container_width=True):
                st.session_state.current_view = "chat"
                st.rerun()
        with pill_cols[1]:
            if st.button("🌐 Otwórz stronę", use_container_width=True):
                st.session_state.current_view = "customize"
                st.rerun()
        with pill_cols[2]:
            if st.button("📊 Google Sheets", use_container_width=True):
                st.session_state.current_view = "customize"
                st.rerun()
        with pill_cols[3]:
            if st.button("🦈 StatShark", use_container_width=True):
                webbrowser.open("https://statshark.net/")
        with pill_cols[4]:
            if st.button("🦷 SRE Bot", use_container_width=True):
                webbrowser.open("https://sre.pawjob.us/")
        with pill_cols[5]:
            if st.button("⚡ Hook Layer", use_container_width=True):
                st.session_state.current_view = "customize"
                st.rerun()

        if user_prompt:
            st.session_state.current_chat_id = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            st.session_state.chat_messages = [{"role": "user", "content": user_prompt}]
            st.session_state.current_view = "chat"
            st.rerun()


# ---------------------------------------------------------------------------
# VIEW 2: CHAT (AUTONOMOUS ANTIGRAVITY AGENT)
# ---------------------------------------------------------------------------
elif st.session_state.current_view == "chat":
    pname = "Czat Autonomiczny (Antigravity Agent)"
    
    # System prompt for full agent powers
    system_inst = """Jesteś zaawansowanym autonomicznym agentem AI łączącym styl Claude z potęgą Google Antigravity.
Masz pełne uprawnienia do działania na komputerze i w internecie:
1. Przeglądarka i strony:
   - Jeśli chcesz pobrać/przeczytać stronę lub TikToka: użyj [BROWSE: url]
   - Jeśli użytkownik chce, abyś otworzył stronę w jego domyślnej przeglądarce: użyj [OPEN_BROWSER: url]
   - Jeśli trzeba przeszukać internet: użyj [SEARCH: zapytanie]
2. System i pliki:
   - Wykonywanie komend (PowerShell / Python / CLI): użyj [EXEC] komenda [/EXEC]
   - Zapis plików: użyj [WRITE_FILE: sciezka] tresc [/WRITE_FILE]
   - Odczyt plików: użyj [READ_FILE: sciezka]
3. Styl:
   - Odpowiadaj nowocześnie, prosto do celu, bez zbędnego gadania.
   - Jeśli użytkownik prosi o rozwiązanie problemu — WYKONAJ go sam za pomocą dostępnych narzędzi!"""

    if st.session_state.active_project and os.path.exists(st.session_state.active_project):
        meta = load_json(os.path.join(st.session_state.active_project, "meta.json"), {})
        pname = meta.get("name", "Projekt")
        if meta.get("instructions"):
            system_inst += f"\n\nKONTEKST PROJEKTU:\n{meta.get('instructions')}"

    col_h1, col_h2, col_h3 = st.columns([5, 3, 2])
    with col_h1:
        st.markdown(f"### 💬 {pname}")
    with col_h2:
        model_choice = st.selectbox(
            "Model",
            ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"],
            index=0,
            label_visibility="collapsed"
        )
    with col_h3:
        if st.button("📁 Projekty"):
            st.session_state.current_view = "projects"
            st.rerun()

    st.markdown("---")

    for msg in st.session_state.chat_messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])
            # Display executed agent actions
            for act in msg.get("actions", []):
                st.markdown(f"<span class='antigravity-badge'>⚡ Antigravity: {act['type']}</span>", unsafe_allow_html=True)
                st.caption(f"Cel: `{act['action']}`")
                st.code(act["result"], language="bash")
            for aid in msg.get("artifacts", []):
                st.info(f"📑 Nowy artefakt: `{aid}` (zakładka Artefakty)")

    if chat_input := st.chat_input("Napisz polecenie (np. 'Wyszukaj w necie...', 'Otwórz stronę StatShark', 'Napisz skrypt...'):"):
        st.session_state.chat_messages.append({"role": "user", "content": chat_input})
        with st.chat_message("user"):
            st.markdown(chat_input)

        with st.chat_message("assistant"):
            stream_container = st.empty()
            
            # Context from sheets
            sheet_ctx = ""
            if os.path.exists(SHEET_CACHE_FILE):
                try:
                    df = pd.read_csv(SHEET_CACHE_FILE)
                    sheet_ctx = f"\n\n[DANE Z ARKUSZA GOOGLE]:\n{df.head(10).to_markdown()}"
                except Exception:
                    pass

            full_prompt = f"{chat_input}{sheet_ctx}"
            response = generate_ai_response(
                full_prompt, system_inst, cfg["key_gemini"], model_choice, stream_container
            )
            stream_container.markdown(response)

            # Auto-run Antigravity actions
            executed_actions = []
            if cfg.get("hook_auto_exec", True):
                executed_actions = parse_and_run_agent_actions(response)
                for act in executed_actions:
                    st.markdown(f"<span class='antigravity-badge'>⚡ Antigravity: {act['type']}</span>", unsafe_allow_html=True)
                    st.caption(f"Akcja: `{act['action']}`")
                    st.code(act["result"], language="bash")

            saved_artifacts = parse_and_save_artifacts(response, pname)

            msg_data = {
                "role": "assistant",
                "content": response,
                "actions": executed_actions,
                "artifacts": saved_artifacts,
            }
            st.session_state.chat_messages.append(msg_data)

            # Auto-save
            if st.session_state.active_project:
                cid = st.session_state.current_chat_id or datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
                chats_dir = os.path.join(st.session_state.active_project, "chats")
                os.makedirs(chats_dir, exist_ok=True)
                title = chat_input[:40]
                save_json(os.path.join(chats_dir, f"{cid}.json"), {
                    "title": title,
                    "date": datetime.datetime.now().isoformat(),
                    "messages": st.session_state.chat_messages,
                    "model": model_choice,
                })


# ---------------------------------------------------------------------------
# VIEW 3: PROJECTS
# ---------------------------------------------------------------------------
elif st.session_state.current_view == "projects":
    st.markdown("## 📁 Projekty (Projects)")
    st.caption("Twórz i zarządzaj swoimi własnymi projektami oraz folderami.")
    
    col_p1, col_p2 = st.columns([1, 1])
    with col_p1:
        new_proj_name = st.text_input("Nazwa nowego projektu", placeholder="np. Kampania SQB")
    with col_p2:
        new_proj_instr = st.text_input("Instrukcje systemowe dla AI", placeholder="Opisz rolę AI...")
    if st.button("➕ Stwórz projekt") and new_proj_name:
        safe = re.sub(r'[^\w\s-]', '', new_proj_name).strip().replace(' ', '_')
        pdir = os.path.join(PROJECTS_DIR, safe)
        os.makedirs(os.path.join(pdir, "context"), exist_ok=True)
        os.makedirs(os.path.join(pdir, "chats"), exist_ok=True)
        save_json(os.path.join(pdir, "meta.json"), {
            "name": new_proj_name,
            "instructions": new_proj_instr or "Jesteś pomocnym asystentem w tym projekcie.",
            "memory": [],
            "created": datetime.datetime.now().isoformat(),
        })
        st.success(f"Utworzono projekt: {new_proj_name}")
        st.rerun()

    st.markdown("---")

    projects = []
    if os.path.exists(PROJECTS_DIR):
        for d in sorted(os.listdir(PROJECTS_DIR)):
            mpath = os.path.join(PROJECTS_DIR, d, "meta.json")
            if os.path.exists(mpath):
                meta = load_json(mpath, {})
                meta["_dir"] = d
                meta["_path"] = os.path.join(PROJECTS_DIR, d)
                projects.append(meta)

    for p in projects:
        with st.container():
            st.markdown(f"""
            <div class='custom-card'>
                <div style='display: flex; justify-content: space-between; align-items: center;'>
                    <h4 style='margin: 0; color: #f4f4f5;'>📁 {p['name']}</h4>
                    <span style='color: #71717a; font-size: 0.8rem;'>{p.get('created', '')[:10]}</span>
                </div>
                <div style='color: #a1a1aa; font-size: 0.88rem; margin: 8px 0;'>
                    {p.get('instructions', '')[:160]}...
                </div>
            </div>
            """, unsafe_allow_html=True)
            
            c1, c2, c3 = st.columns([3, 4, 1])
            with c1:
                if st.button(f"💬 Otwórz czat", key=f"open_{p['_dir']}"):
                    st.session_state.active_project = p["_path"]
                    st.session_state.current_chat_id = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
                    st.session_state.chat_messages = []
                    st.session_state.current_view = "chat"
                    st.rerun()
            with c2:
                ctx_dir = os.path.join(p["_path"], "context")
                fcnt = len(os.listdir(ctx_dir)) if os.path.exists(ctx_dir) else 0
                st.caption(f"📎 Pliki: {fcnt}")
            with c3:
                if st.button("🗑", key=f"delp_{p['_dir']}"):
                    import shutil
                    shutil.rmtree(p["_path"], ignore_errors=True)
                    st.rerun()


# ---------------------------------------------------------------------------
# VIEW 4: ARTIFACTS
# ---------------------------------------------------------------------------
elif st.session_state.current_view == "artifacts":
    st.markdown("## 📑 Artefakty (Artifacts)")
    st.caption("Przeglądaj wygenerowany kod, dokumenty i podgląd na żywo.")

    artifacts = []
    if os.path.exists(ARTIFACTS_DIR):
        for af in sorted(os.listdir(ARTIFACTS_DIR), reverse=True):
            if af.endswith(".json"):
                adata = load_json(os.path.join(ARTIFACTS_DIR, af), {})
                adata["_file"] = af
                artifacts.append(adata)

    if not artifacts:
        st.caption("Brak artefaktów. Poproś AI w czacie o kod, stronę HTML lub dokument.")
    else:
        for art in artifacts:
            with st.expander(f"📑 {art.get('title', 'Artefakt')} — {art.get('created', '')[:10]}", expanded=True):
                content = art.get("content", "")
                lang = art.get("language", "text")
                if lang == "html":
                    st.components.v1.html(content, height=350, scrolling=True)
                elif lang in ["python", "json", "csv", "bash"]:
                    st.code(content, language=lang)
                else:
                    st.markdown(content)


# ---------------------------------------------------------------------------
# VIEW 5: CUSTOMIZE
# ---------------------------------------------------------------------------
elif st.session_state.current_view == "customize":
    st.markdown("## ⚙️ Customize (Wtyczki & Narzędzia)")

    cust_tab1, cust_tab2, cust_tab3 = st.tabs([
        "🌐 Narzędzia WWW & WT", "📊 Google Sheets", "⚡ Hook Layer"
    ])

    with cust_tab1:
        st.subheader("🌐 Szybkie linki i narzędzia przeglądarki")
        c1, c2 = st.columns(2)
        with c1:
            st.markdown("""
            <div class='custom-card'>
                <h4>🦈 StatShark</h4>
                <p style='color:#a1a1aa;font-size:0.85rem;'>Analityka dywizjonów i graczy War Thunder.</p>
            </div>
            """, unsafe_allow_html=True)
            if st.button("Otwórz StatShark w przeglądarce", use_container_width=True):
                webbrowser.open("https://statshark.net/")

        with c2:
            st.markdown("""
            <div class='custom-card'>
                <h4>🦷 Toothless' SRE Bot</h4>
                <p style='color:#a1a1aa;font-size:0.85rem;'>Tracker meczów i tabeli SQB na żywo.</p>
            </div>
            """, unsafe_allow_html=True)
            if st.button("Otwórz SRE w przeglądarce", use_container_width=True):
                webbrowser.open("https://sre.pawjob.us/")

    with cust_tab2:
        st.subheader("📊 Google Sheets")
        s_url = st.text_input("URL Arkusza", value=cfg.get("sheet_url", DEFAULT_SHEET_URL))
        if s_url != cfg.get("sheet_url", ""):
            cfg["sheet_url"] = s_url
            save_config(cfg)

        up = st.file_uploader("Wrzuć plik Excel (.xlsx) / CSV", type=["csv", "xlsx"])
        if up:
            df = pd.read_csv(up) if up.name.endswith(".csv") else pd.read_excel(up)
            df.to_csv(SHEET_CACHE_FILE, index=False)
            st.success(f"Załadowano {len(df)} rekordów!")

        if os.path.exists(SHEET_CACHE_FILE):
            try:
                st.dataframe(pd.read_csv(SHEET_CACHE_FILE), use_container_width=True, height=250)
            except Exception:
                pass

    with cust_tab3:
        st.subheader("⚡ Hook Layer & Terminal")
        h_toggle = st.toggle("Automatyczne wykonywanie akcji przez AI", value=cfg.get("hook_auto_exec", True))
        if h_toggle != cfg.get("hook_auto_exec", True):
            cfg["hook_auto_exec"] = h_toggle
            save_config(cfg)


# ---------------------------------------------------------------------------
# VIEW 6: SEARCH
# ---------------------------------------------------------------------------
elif st.session_state.current_view == "search":
    st.markdown("## 🔍 Szukaj (Search)")
    q = st.text_input("Wpisz frazę...", placeholder="Szukaj w czatach i plikach...")
    if q:
        st.caption("Wyniki wyszukiwania...")
