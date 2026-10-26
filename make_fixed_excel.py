import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
import time
import webbrowser
import win32com.client
import pyautogui
import pygetwindow as gw

file_path = r"c:\Antygravity\Meta_SQB_Fixed.xlsx"

wb = openpyxl.Workbook()
ws = wb.active
ws.title = "Czysta Meta SQB"

nations = ["Rosja", "Niemcy", "USA", "Chiny", "Szwecja", "Brytole", "Japonia", "Francja", "Italia", "Izrael"]

# W 100% dostosowane do najnowszej mety SQB (V 2026) i zgodnie z przesłanym wzorcem dla Top Tiera
brs_data = {
    "14.3": {
        "Rosja": [("Pantsir", 'G'), ("T90M", 'G'), ("K52", 'G'), ("SU30SM", 'G'), ("T80BVM", 'Y'), ("SU34", 'Y')],
        "Niemcy": [("EF2000", 'G'), ("Leo2A7", 'G'), ("LeoPSO", 'G'), ("PUMA VJTF", 'Y'), ("TigerUHT", 'Y')],
        "USA": [("Abrams Sepv2/Sepv1", 'G'), ("F/A18C", 'G'), ("F15E", 'Y'), ("Adats", 'Y')],
        "Chiny": [("VT4A1", 'G'), ("WZ LCT", 'G'), ("ZTZ99A", 'Y'), ("HQ17", 'Y'), ("Z10", 'G')],
        "Szwecja": [("Strv122B+", 'G'), ("Ito90", 'G'), ("GripenC/A", 'G'), ("Strv122A", 'Y')],
        "Brytole": [("Challanger 3TD", 'G'), ("Black Night", 'G'), ("Typhon FGR4", 'G')],
        "Japonia": [("Type 10", 'G'), ("TKX", 'G'), ("Type81c", 'G'), ("Gripen", 'Y')],
        "Francja": [("Leclerc Azur", 'G'), ("Leclerc SXXI", 'G'), ("ItO 90M", 'G'), ("Rafale CF3", 'G'), ("Tiger Had Block2", 'G')],
        "Italia": [("Leo2a7", 'G'), ("F2000A", 'G'), ("Gripen", 'Y')],
        "Izrael": [("Merkava MK4M", 'Y'), ("Namer Triskhon", 'Y'), ("AH60", 'G')]
    },
    "12.0": {
        "Rosja": [("Pantsir", 'G'), ("T-80U", 'G'), ("BMP-2M", 'G'), ("Su-25T", 'Y')],
        "Niemcy": [("Leopard 2A7V", 'G'), ("F-4F KWS LV", 'Y')],
        "USA": [("M1A2 SEP V2", 'G'), ("AV-8B Plus", 'Y')],
        "Szwecja": [("Strv 122A", 'G'), ("ItO 90M", 'G'), ("JAS 39A Gripen", 'G')],
        "Japonia": [("Type 10", 'G'), ("Type 81C", 'G')],
        "Brytole": [("Challenger 2E", 'G'), ("AH Mk.1 Apache", 'G'), ("Harrier GR.7", 'Y')],
        "Francja": [("Leclerc S2", 'G'), ("Mirage 2000-5F", 'G')],
        "Chiny": [("ZTZ99A", 'G'), ("Z-10", 'Y')]
    },
    "11.0": {
        "Rosja": [("T-80U-E1", 'G'), ("T-90A", 'Y'), ("Ka-50", 'G'), ("Pantsir", 'G')],
        "Niemcy": [("Leopard 2A6", 'G'), ("Leopard 2A4", 'Y')],
        "USA": [("M1A1 AIM", 'G'), ("M1A1 Click-Bait", 'G'), ("ADATS", 'G')],
        "Brytole": [("Challenger 2", 'G'), ("ADATS (M113)", 'G')],
        "Francja": [("Leclerc S1", 'G')],
        "Chiny": [("ZTZ99 II", 'G')]
    },
    "10.0": {
        "Rosja": [("BMP-2M", 'G'), ("T-80B", 'G'), ("2S6 Tunguska", 'G'), ("Su-25K", 'Y')],
        "Niemcy": [("Leopard 2A4", 'G'), ("FlaRakPz 1", 'Y')],
        "USA": [("M1 Abrams", 'G'), ("LAV-AD", 'G'), ("A-6E TRAM", 'Y')],
        "Francja": [("AMX-40", 'G'), ("Roland 1", 'Y')],
        "Szwecja": [("Strf 9040C", 'G'), ("CV90105", 'G')]
    },
    "9.0": {
        "Rosja": [("T-64B", 'G'), ("BMP-3", 'Y')],
        "Niemcy": [("Leopard A1A1 (L/44)", 'G'), ("Gepard 1A2", 'G'), ("Begleitpanzer 57", 'G')],
        "USA": [("XM-1", 'G'), ("A-10A Early", 'G')],
        "Brytole": [("Chieftain Mk.10", 'G'), ("ZA-35", 'G')]
    },
    "8.0": {
        "Rosja": [("T-55A", 'G'), ("IS-7", 'G'), ("PT-76-57", 'Y')],
        "Niemcy": [("Turm III", 'G'), ("Gepard", 'G'), ("G.91 R/3", 'G')],
        "USA": [("M60A1 (AOS)", 'G'), ("A-4B Skyhawk", 'G')],
        "Chiny": [("ZTZ59D1", 'G'), ("WZ305", 'Y')],
        "Brytole": [("Scimitar F Mk.1", 'G'), ("Chieftain Marksman", 'Y')]
    },
    "7.0": {
        "Rosja": [("IS-3", 'G'), ("T-44-100", 'G'), ("ZSU-23-4", 'G'), ("BI", 'G')],
        "Niemcy": [("Tiger II (10.5cm)", 'G'), ("Ar 234 C-3", 'G')],
        "USA": [("T32", 'G'), ("T29", 'G'), ("F8F-1B", 'Y')],
        "Francja": [("Lorraine 40t", 'G'), ("AMX-50", 'Y')]
    },
    "6.0": {
        "Niemcy": [("Tiger II (H)", 'G'), ("Me 262 A-1/U4", 'G'), ("Zerstörer 45", 'G')],
        "USA": [("T26E5", 'G'), ("A-1H Skyraider", 'G'), ("M41A1", 'Y')],
        "Rosja": [("T-34-100", 'G'), ("Tu-2S", 'G'), ("IS-2", 'Y')],
        "Brytole": [("Spitfire LF Mk IX", 'G'), ("Skink", 'G')]
    },
    "5.0": {
        "Niemcy": [("Panther D", 'G'), ("Ostwind II", 'G'), ("VK 3002 (M)", 'G')],
        "Rosja": [("T-34-85", 'G'), ("KV-85", 'Y'), ("Yak-3T", 'G')],
        "USA": [("M4A3E2 Jumbo", 'G'), ("F4U-1C", 'G'), ("M42", 'Y')]
    },
    "4.7": {
        "Rosja": [("T-34-57", 'G'), ("ISU-152", 'G'), ("Su-8", 'Y')],
        "USA": [("T14", 'G'), ("T77E1", 'G'), ("F8F-1", 'G')]
    }
}

all_brs = ["14.3", "12.7", "12.3", "12.0", "11.7", "11.3", "11.0", "10.7", "10.3", "10.0", "9.7", "9.3", "9.0", "8.7", "8.3", "8.0", "7.7", "7.3", "7.0", "6.7", "6.3", "6.0", "5.7", "5.3", "5.0", "4.7", "4.3"]

current_row = 1

dark_bg = PatternFill(start_color="333338", end_color="333338", fill_type="solid") 
main_title_font = Font(color="FFFFFF", bold=True, size=24)
br_font = Font(color="FFFFFF", bold=True, size=18)
nation_font = Font(color="FFFFFF", bold=True, size=14)
green_font = Font(color="00FF00", bold=True, size=12)
yellow_font = Font(color="FFD700", bold=True, size=12)
center_align = Alignment(horizontal="left", vertical="center")

red_bottom_border = Border(bottom=Side(style='thick', color='FF0000'))
white_bottom_border = Border(bottom=Side(style='thick', color='FFFFFF'))

for r in range(1, 600):
    for c in range(1, 11):
        ws.cell(row=r, column=c).fill = dark_bg

ws.cell(row=current_row, column=1, value="Maszyny topowe sqb").font = main_title_font
ws.cell(row=current_row, column=1).border = white_bottom_border
ws.cell(row=current_row, column=2).border = white_bottom_border
ws.cell(row=current_row, column=3).border = white_bottom_border
current_row += 3

for br in all_brs:
    title_cell = ws.cell(row=current_row, column=1, value=f"--- BR {br} ---")
    title_cell.font = br_font
    current_row += 2
    
    for idx, nat in enumerate(nations):
        c = ws.cell(row=current_row, column=idx+1, value=nat)
        c.font = nation_font
        c.border = red_bottom_border
    current_row += 1
    
    vehicles = brs_data.get(br, {})
    max_v = max([len(vehicles.get(n, [])) for n in nations] + [0])
    rows_to_add = max(max_v, 2)
    
    for r in range(rows_to_add):
        for idx, nat in enumerate(nations):
            v_list = vehicles.get(nat, [])
            if r < len(v_list):
                v_name, v_col = v_list[r]
                c = ws.cell(row=current_row + r, column=idx+1, value=v_name)
                c.font = green_font if v_col == 'G' else yellow_font
            else:
                c = ws.cell(row=current_row + r, column=idx+1, value="")
            c.alignment = center_align
    
    current_row += rows_to_add + 2

for i in range(1, 11):
    from openpyxl.utils import get_column_letter
    ws.column_dimensions[get_column_letter(i)].width = 24

wb.save(file_path)

print("Kopiowanie do schowka...")
excel = win32com.client.Dispatch("Excel.Application")
excel.Visible = False
workbook = excel.Workbooks.Open(file_path)
worksheet = workbook.ActiveSheet
worksheet.UsedRange.Copy()

print("Otwieram arkusz w przeglądarce...")
google_sheets_url = "https://docs.google.com/spreadsheets/d/1tZzjRk2bs4ZzIXOgRwg26zc3uvOizjKTIC_VdecZOMc/edit?gid=0#gid=0"
webbrowser.open(google_sheets_url)

print("Czekam na załadowanie...")
time.sleep(12)

windows = gw.getAllWindows()
sheets_win = None
for w in windows:
    if 'Arkusze Google' in w.title or 'Google Sheets' in w.title or 'SQB' in w.title.upper() or 'META' in w.title.upper():
        sheets_win = w
        break

if sheets_win:
    try:
        if sheets_win.isMinimized:
            sheets_win.restore()
        sheets_win.activate()
    except:
        pass

time.sleep(1.5)
pyautogui.hotkey('ctrl', 'home')
time.sleep(0.5)
pyautogui.hotkey('ctrl', 'a')
time.sleep(0.5)
pyautogui.press('delete')
time.sleep(0.5)
pyautogui.hotkey('ctrl', 'home')
time.sleep(0.5)
pyautogui.hotkey('ctrl', 'v')

print("Wklejono ostateczną metę!")
time.sleep(2)

excel.CutCopyMode = False
workbook.Close(False)
excel.Quit()
