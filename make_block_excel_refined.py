import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
import time
import webbrowser
import win32com.client
import pyautogui
import pygetwindow as gw

file_path = r"c:\Antygravity\Meta_SQB_Blocks_Refined.xlsx"

wb = openpyxl.Workbook()
ws = wb.active
ws.title = "Czysta Meta SQB"

nations = ["Rosja", "Niemcy", "USA", "Chiny", "Szwecja", "Brytole", "Japonia", "Francja", "Italia", "Izrael"]

brs_data = {
    "14.3": {
        "Rosja": [("Pantsir-S1", 'G'), ("T-90M", 'G'), ("Ka-52", 'G'), ("Su-30SM", 'G'), ("Pantsir SM-SV", 'Y'), ("Mi-28NM", 'Y')],
        "Niemcy": [("Eurofighter", 'G'), ("Leopard 2A7V", 'G'), ("Tiger UHT", 'Y')],
        "USA": [("M1A2 SEP V2", 'G'), ("F-15E", 'G'), ("F/A-18C", 'Y'), ("ADATS", 'Y')],
        "Chiny": [("Z-10ME", 'G'), ("VT4A1", 'G'), ("WZ LCT", 'Y'), ("HQ17", 'Y')],
        "Szwecja": [("Strv 122B+", 'G'), ("ItO 90M", 'G'), ("JAS 39C Gripen", 'G')],
        "Brytole": [("Challenger 3TD", 'G'), ("Black Night", 'G'), ("Typhoon FGR4", 'G')],
        "Japonia": [("Type 10", 'G'), ("Type 81C", 'G'), ("TKX", 'Y')],
        "Francja": [("Rafale C", 'G'), ("Leclerc SXXI", 'G'), ("ItO 90M", 'G')],
        "Italia": [("Leo 2A7", 'G'), ("F2000A", 'G'), ("Gripen", 'Y')],
        "Izrael": [("Merkava Mk 4M", 'Y'), ("Namer", 'Y'), ("AH-60", 'G')]
    },
    "12.0": {
        "Rosja": [("Pantsir-S1", 'G'), ("T-80U", 'G'), ("2S38", 'Y'), ("Ka-52", 'G')],
        "Niemcy": [("Leopard 2A7V", 'G'), ("F-4F KWS LV", 'Y')],
        "USA": [("M1A2 SEP V2", 'G'), ("AV-8B Plus", 'Y')],
        "Szwecja": [("Strv 122A / PLSS", 'G'), ("ItO 90M", 'G'), ("JAS 39A Gripen", 'G')],
        "Japonia": [("Type 10", 'G'), ("Type 81C", 'G')],
        "Brytole": [("AH Mk.1 Apache", 'G'), ("Harrier GR.7", 'Y')]
    },
    "11.0": {
        "Rosja": [("T-80U-E1", 'G'), ("Pantsir-S1", 'G')],
        "Niemcy": [("Leopard 2A6", 'G'), ("Leopard 2A4", 'Y')],
        "USA": [("M1A1 Click-Bait", 'G'), ("ADATS", 'G')],
        "Brytole": [("ADATS (M113)", 'G')]
    },
    "10.0": {
        "Rosja": [("BMP-2M", 'G'), ("2S6 Tunguska", 'G'), ("T-80B", 'Y')],
        "Niemcy": [("Leopard 2A4", 'G')],
        "USA": [("LAV-AD", 'G')],
        "Francja": [("AMX-40", 'G')]
    },
    "9.0": {
        "Rosja": [("T-64B", 'G')],
        "Niemcy": [("Leopard A1A1 (L/44)", 'G'), ("Gepard 1A2", 'G'), ("Begleitpanzer 57", 'Y')],
        "USA": [("A-10A Early", 'G'), ("XM-1 (Chrysler)", 'Y')],
        "Brytole": [("ZA-35", 'G')]
    },
    "8.0": {
        "Rosja": [("T-55A", 'G'), ("IS-7", 'G'), ("PT-76-57", 'Y')],
        "Niemcy": [("Gepard", 'G'), ("Turm III", 'Y'), ("G.91 R/3", 'Y')],
        "USA": [("M60A1 (AOS)", 'G'), ("A-4B Skyhawk", 'Y')],
        "Brytole": [("Scimitar F Mk.1", 'G'), ("Chieftain Marksman", 'Y')],
        "Chiny": [("ZTZ59D1", 'G')]
    },
    "7.0": {
        "Rosja": [("IS-3", 'G'), ("ZSU-23-4M2", 'G'), ("BI", 'Y'), ("T-44-100", 'Y')],
        "Niemcy": [("Ar 234 C-3", 'G')],
        "USA": [("T32", 'G'), ("T29", 'G')],
        "Francja": [("Lorraine 40t", 'G'), ("AMX-50", 'Y')],
        "Japonia": [("HS Typ 99", 'G')]
    },
    "6.0": {
        "Rosja": [("Tu-2S", 'G'), ("T-34-100", 'Y')],
        "Niemcy": [("Tiger II (H) Sla.16", 'G'), ("Me 262 A-1/U4", 'G'), ("Zerstörer 45", 'Y'), ("Ju 288 C", 'Y')],
        "USA": [("T26E5", 'G'), ("A-1H Skyraider", 'Y')],
        "Brytole": [("Skink", 'G'), ("Spitfire LF Mk IX", 'Y')]
    },
    "5.0": {
        "Rosja": [("T-34-85", 'G'), ("Tu-2", 'G'), ("Yak-3T", 'Y')],
        "Niemcy": [("Panther D", 'G'), ("Ostwind II", 'G'), ("Tiger H1", 'Y')],
        "USA": [("M4A3E2 Jumbo", 'G'), ("F4U-1C Corsair", 'G')],
        "Francja": [("M4A4 (SA50)", 'G'), ("AMX-13 DCA 40", 'Y')],
        "Japonia": [("SUB-I-II", 'G')]
    },
    "4.7": {
        "Rosja": [("T-34-57", 'G'), ("ISU-152", 'G'), ("Su-8", 'Y')],
        "USA": [("T14", 'G'), ("T77E1", 'G'), ("F8F-1 Bearcat", 'Y')],
        "Brytole": [("Spitfire F Mk IX", 'G')],
        "Italia": [("M42 Contraereo", 'G')]
    }
}

# Adjusted BR list based on user request:
all_brs = ["14.3", "12.0", "11.0", "10.7", "10.0", "9.7", "9.0", "8.7", "8.0", "7.3", "7.0", "6.3", "6.0", "5.7", "5.0", "4.7"]
current_row = 1

dark_bg = PatternFill(start_color="1A1A1A", end_color="1A1A1A", fill_type="solid") 
br_bg = PatternFill(start_color="242424", end_color="242424", fill_type="solid")
nation_bg = PatternFill(start_color="1A1A1A", end_color="1A1A1A", fill_type="solid")

main_title_font = Font(color="FFFFFF", bold=True, size=16)
br_font = Font(color="E0E0E0", bold=True, size=12)
nation_font = Font(color="B0B0B0", bold=False, size=11)
green_font = Font(color="66BB6A", bold=False, size=10) # Minimalist muted green
yellow_font = Font(color="FFEE58", bold=False, size=10) # Minimalist muted yellow

center_align = Alignment(horizontal="center", vertical="center")
left_align = Alignment(horizontal="left", vertical="center")

# Thin subtle borders
thin_border = Border(bottom=Side(style='thin', color='424242')) 

# Init background
for r in range(1, 400):
    for c in range(1, 11):
        ws.cell(row=r, column=c).fill = dark_bg

# Main Title
ws.cell(row=current_row, column=1, value="Meta SQB").font = main_title_font
ws.cell(row=current_row, column=1).alignment = left_align
for c in range(1, 11):
    ws.cell(row=current_row, column=c).border = thin_border
ws.merge_cells(start_row=current_row, start_column=1, end_row=current_row, end_column=10)
ws.row_dimensions[current_row].height = 30
current_row += 2

for br in all_brs:
    # BR Title
    ws.merge_cells(start_row=current_row, start_column=1, end_row=current_row, end_column=10)
    title_cell = ws.cell(row=current_row, column=1, value=f"BR {br}")
    title_cell.font = br_font
    title_cell.alignment = center_align
    for c in range(1, 11):
        ws.cell(row=current_row, column=c).fill = br_bg
    ws.row_dimensions[current_row].height = 20
    current_row += 1
    
    # Print Nations Header
    for idx, nat in enumerate(nations):
        c = ws.cell(row=current_row, column=idx+1, value=nat)
        c.font = nation_font
        c.border = thin_border
        c.fill = nation_bg
        c.alignment = center_align
    ws.row_dimensions[current_row].height = 18
    current_row += 1
    
    vehicles = brs_data.get(br, {})
    max_v = max([len(vehicles.get(n, [])) for n in nations] + [0])
    
    # "Zostaw miejsce na przyszłe poprawki" - Always leave at least 1 empty row, minimum 3 total rows per BR
    rows_to_add = max(max_v + 2, 4)
    
    for r in range(rows_to_add):
        ws.row_dimensions[current_row + r].height = 18 # slightly taller for readability
        for idx, nat in enumerate(nations):
            v_list = vehicles.get(nat, [])
            if r < len(v_list):
                v_name, v_col = v_list[r]
                c = ws.cell(row=current_row + r, column=idx+1, value=v_name)
                c.font = green_font if v_col == 'G' else yellow_font
            else:
                # Empty slots for future updates
                c = ws.cell(row=current_row + r, column=idx+1, value="")
            c.alignment = center_align
    
    current_row += rows_to_add + 1 # Add 1 row of complete separation between BR blocks

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

print("Czekam 10 sekund na załadowanie...")
time.sleep(10)

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

time.sleep(2)
pyautogui.click(800, 500) # Click middle of screen to ensure focus
time.sleep(0.5)
pyautogui.hotkey('ctrl', 'home')
time.sleep(0.5)
pyautogui.hotkey('ctrl', 'a')
time.sleep(0.5)
pyautogui.press('delete')
time.sleep(0.5)
pyautogui.hotkey('ctrl', 'home')
time.sleep(0.5)
pyautogui.hotkey('ctrl', 'v')

print("Wklejono dopracowaną metę!")
time.sleep(2)

excel.CutCopyMode = False
workbook.Close(False)
excel.Quit()
print("Plik wygenerowany.")
