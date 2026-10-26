import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
import time
import webbrowser
import win32com.client
import pyautogui
import pygetwindow as gw

file_path = r"c:\Antygravity\Meta_SQB_Blocks.xlsx"

wb = openpyxl.Workbook()
ws = wb.active
ws.title = "Czysta Meta SQB"

nations = ["Rosja", "Niemcy", "USA", "Chiny", "Szwecja", "Brytole", "Japonia", "Francja", "Italia", "Izrael"]

brs_data = {
    "14.3": {
        "Rosja": ["Pantsir-S1", "Pantsir SM-SV", "T-90M", "Ka-52", "Mi-28NM", "Su-30SM"],
        "Niemcy": ["Leopard 2A7V", "Eurofighter", "Tiger UHT"],
        "USA": ["M1A2 SEP V2", "ADATS", "F-15E", "F/A-18C"],
        "Chiny": ["Z-10ME", "VT4A1", "WZ LCT", "ZTZ99A", "HQ17"],
        "Szwecja": ["Strv 122B+", "ItO 90M", "JAS 39C Gripen"],
        "Brytole": ["Challenger 3TD", "Black Night", "Typhoon FGR4"],
        "Japonia": ["Type 10", "TKX", "Type 81C"],
        "Francja": ["Rafale C", "Leclerc Azur", "Leclerc SXXI", "ItO 90M"],
        "Italia": ["Leo 2A7", "F2000A", "Gripen"],
        "Izrael": ["Merkava Mk 4M", "Namer", "AH-60"]
    },
    "12.0": {
        "Rosja": ["Pantsir-S1", "T-80U", "2S38", "Ka-52"],
        "Niemcy": ["Leopard 2A7V", "F-4F KWS LV"],
        "USA": ["M1A2 SEP V2", "AV-8B Plus"],
        "Szwecja": ["Strv 122A / PLSS", "ItO 90M", "JAS 39A Gripen"],
        "Japonia": ["Type 10", "Type 81C"],
        "Brytole": ["AH Mk.1 Apache", "Harrier GR.7"]
    },
    "11.0": {
        "Rosja": ["T-80U-E1", "Pantsir-S1"],
        "Niemcy": ["Leopard 2A6", "Leopard 2A4"],
        "USA": ["M1A1 Click-Bait", "ADATS"],
        "Brytole": ["ADATS (M113)"]
    },
    "10.0": {
        "Rosja": ["BMP-2M", "T-80B", "2S6 Tunguska"],
        "Niemcy": ["Leopard 2A4"],
        "USA": ["LAV-AD"],
        "Francja": ["AMX-40"]
    },
    "9.0": {
        "Rosja": ["T-64B"],
        "Niemcy": ["Leopard A1A1 (L/44)", "Begleitpanzer 57", "Gepard 1A2"],
        "USA": ["A-10A Early", "XM-1 (Chrysler)"],
        "Brytole": ["ZA-35"]
    },
    "8.0": {
        "Rosja": ["T-55A", "IS-7", "PT-76-57"],
        "Niemcy": ["Turm III", "Gepard", "G.91 R/3"],
        "USA": ["M60A1 (AOS/RISE)", "A-4B Skyhawk"],
        "Brytole": ["Scimitar F Mk.1", "Chieftain Marksman"],
        "Chiny": ["ZTZ59D1"]
    },
    "7.0": {
        "Rosja": ["IS-3", "T-44-100", "ZSU-23-4M2", "BI"],
        "Niemcy": ["Ar 234 C-3"],
        "USA": ["T32", "T29"],
        "Francja": ["Lorraine 40t", "AMX-50"],
        "Japonia": ["HS Typ 99"]
    },
    "6.0": {
        "Rosja": ["T-34-100", "Tu-2S"],
        "Niemcy": ["Tiger II (H) Sla.16", "Panther G/F", "Zerstörer 45", "Me 262 A-1/U4", "Ju 288 C"],
        "USA": ["T26E5", "A-1H Skyraider"],
        "Brytole": ["Spitfire LF Mk IX", "Skink"]
    },
    "5.0": {
        "Rosja": ["T-34-85", "Yak-3T", "Tu-2", "KV-85"],
        "Niemcy": ["Panther D", "Tiger H1", "Ostwind II", "Bf 109 G-14", "VK 3002(M)"],
        "USA": ["M4A3E2 Jumbo", "F4U-1C Corsair", "P-51D-30"],
        "Francja": ["M4A4 (SA50)", "AMX-13 DCA 40"],
        "Japonia": ["SUB-I-II"]
    },
    "4.7": {
        "Rosja": ["T-34-57", "ISU-152", "Su-8"],
        "USA": ["T14", "T77E1", "F8F-1 Bearcat"],
        "Brytole": ["Spitfire F Mk IX"],
        "Italia": ["M42 Contraereo"]
    }
}

# Create BR blocks with empty placeholders in between
all_brs = ["14.3", "14.0", "13.7", "13.3", "13.0", "12.7", "12.3", "12.0", "11.7", "11.3", "11.0", "10.7", "10.3", "10.0", "9.7", "9.3", "9.0", "8.7", "8.3", "8.0", "7.7", "7.3", "7.0", "6.7", "6.3", "6.0", "5.7", "5.3", "5.0", "4.7", "4.3", "4.0", "3.7", "3.3", "3.0", "2.7", "2.3", "2.0", "1.7", "1.3", "1.0"]

current_row = 1

dark_bg = PatternFill(start_color="202124", end_color="202124", fill_type="solid")
br_font = Font(color="FFFFFF", bold=True, size=16)
nation_font = Font(color="FFFFFF", bold=True, size=12, underline="single")
green_font = Font(color="00FF00", bold=True, size=11)
center_align = Alignment(horizontal="left", vertical="center")

# Initialize all cells to dark background for a clean look up to 500 rows and 10 cols
for r in range(1, 800):
    for c in range(1, 11):
        ws.cell(row=r, column=c).fill = dark_bg

for br in all_brs:
    # Print BR Title
    title_cell = ws.cell(row=current_row, column=1, value=f"MASZYNY BR {br}")
    title_cell.font = br_font
    current_row += 1
    
    # Print Nations Header
    for idx, nat in enumerate(nations):
        c = ws.cell(row=current_row, column=idx+1, value=nat)
        c.font = nation_font
    current_row += 1
    
    # Print Vehicles
    vehicles = brs_data.get(br, {})
    
    # Find max vehicles in any nation to know how many rows to add
    max_v = 0
    for nat in nations:
        v_list = vehicles.get(nat, [])
        if len(v_list) > max_v:
            max_v = len(v_list)
            
    # Add 2 empty rows at least for adding new ones
    rows_to_add = max(max_v, 2)
    
    for r in range(rows_to_add):
        for idx, nat in enumerate(nations):
            v_list = vehicles.get(nat, [])
            val = v_list[r] if r < len(v_list) else ""
            c = ws.cell(row=current_row + r, column=idx+1, value=val)
            c.font = green_font
            c.alignment = center_align
    
    current_row += rows_to_add + 2 # Add space before next BR

# Set column widths
for i in range(1, 11):
    from openpyxl.utils import get_column_letter
    ws.column_dimensions[get_column_letter(i)].width = 20

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

print("Wklejono blokową metę!")
time.sleep(2)

excel.CutCopyMode = False
workbook.Close(False)
excel.Quit()
