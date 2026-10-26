import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.worksheet.table import Table, TableStyleInfo
from openpyxl.formatting.rule import CellIsRule
import os
import time
import webbrowser
import win32com.client
import pyautogui
import pygetwindow as gw

file_path = r"c:\Antygravity\Meta_SQB_Premium_Full.xlsx"

# 1. GENERATE FULL EXCEL
wb = openpyxl.Workbook()
ws = wb.active
ws.title = "Czysta Meta SQB Premium"

headers = ["BR SQB", "Tier", "Kategoria", "Nacja", "Maszyna", "BR Pojazdu", "Zadanie Taktyczne", "Główny Atut / Uzbrojenie"]
ws.append(headers)

data = [
    # 14.3
    [14.3, "S-Tier", "Myśliwiec", "Niemcy", "Eurofighter Typhoon DA", "14.0", "Przechwytywanie (CAP)", "IRIS-T + Meteor"],
    [14.3, "S-Tier", "Myśliwiec", "Francja", "Rafale C", "14.0", "Dogfight / CAP", "MICA EM/IR"],
    [14.3, "S-Tier", "Szturmówka", "Rosja", "Su-30SM", "14.0", "CAS / CAP", "R-77-1"],
    [14.3, "S-Tier", "Szturmówka", "USA", "F-15E Strike Eagle", "14.0", "CAS", "AIM-120C, duży ładunek"],
    [14.3, "S-Tier", "Myśliwiec", "Szwecja", "JAS 39C Gripen", "14.0", "CAP", "Najlżejszy i najzwinniejszy"],
    [14.3, "A-Tier", "Myśliwiec", "USA", "F/A-18C Hornet", "13.7", "Multi-role", "AIM-120A"],
    [14.3, "S-Tier", "Helikopter", "Rosja", "Ka-52", "12.3", "Zwalczanie czołgów z dystansu", "Vikhr ATGM"],
    [14.3, "S-Tier", "Helikopter", "Rosja", "Mi-28NM", "12.3", "Zwalczanie z ukrycia", "Rakiety LMUR"],
    [14.3, "A-Tier", "Helikopter", "Chiny", "Z-10ME", "12.3", "Wsparcie z powietrza", "HJ-10"],
    [14.3, "S-Tier", "Czołg MBT", "Szwecja", "Strv 122B+", "12.3", "Brawler / Szturm", "Najlepszy pancerz kompozytowy"],
    [14.3, "S-Tier", "Czołg MBT", "Niemcy", "Leopard 2A7V", "12.3", "Snajper / Szturm", "Doskonały celownik termowizyjny"],
    [14.3, "S-Tier", "Czołg MBT", "Rosja", "T-90M", "12.3", "Push punktu", "Sztora APS, Autoloader"],
    [14.3, "A-Tier", "Czołg MBT", "USA", "M1A2 SEP V2", "12.3", "Flankowanie", "Pakiet TUSK, optyka"],
    [14.3, "A-Tier", "Czołg MBT", "Japonia", "Type 10", "12.0", "Agresywne flankowanie", "Szybki autoloader"],
    [14.3, "S-Tier", "Czołg MBT", "Izrael", "Merkava Mk 4M", "12.3", "Defensywa", "Trophy APS (aktywny pancerz)"],
    [14.3, "S-Tier", "SPAA", "Rosja", "Pantsir SM-SV", "12.3", "Parasol Przeciwlotniczy", "Nowy system rakietowy"],
    [14.3, "S-Tier", "SPAA", "Rosja", "Pantsir-S1", "12.0", "Parasol Przeciwlotniczy", "2x30mm + 12 rakiet"],
    [14.3, "S-Tier", "SPAA", "USA", "ADATS", "11.3", "Dual-role (Lotnictwo + Czołgi)", "8 potężnych rakiet ATGM/SAM"],
    [14.3, "A-Tier", "SPAA", "Szwecja", "ItO 90M", "12.0", "Czyste SPAA", "Rakiety Mistral 3"],
    [14.3, "A-Tier", "SPAA", "Japonia", "Type 81C", "11.7", "Czyste SPAA", "Rakiety IR"],
    
    # 12.0
    [12.0, "S-Tier", "Myśliwiec", "Szwecja", "JAS 39A Gripen", "12.0", "Przechwytywanie", "AIM-9L"],
    [12.0, "A-Tier", "Szturmówka", "USA", "AV-8B Plus", "12.0", "CAS / VTOL", "AIM-120A"],
    [12.0, "A-Tier", "Szturmówka", "Wlk. Brytania", "Harrier GR.7", "11.7", "CAS", "AGM-65"],
    [12.0, "A-Tier", "Myśliwiec", "Niemcy", "F-4F KWS LV", "12.0", "Multi-role", "AIM-120A"],
    [12.0, "S-Tier", "Helikopter", "Rosja", "Ka-52", "12.0", "Zwalczanie czołgów", "Najlepszy na swoim BR"],
    [12.0, "A-Tier", "Helikopter", "Wlk. Brytania", "AH Mk.1 Apache", "10.7", "Zwalczanie czołgów", "Hellfire"],
    [12.0, "S-Tier", "Czołg MBT", "Szwecja", "Strv 122A / PLSS", "11.7", "Szturm", "Dominacja pancerza na tym BR"],
    [12.0, "S-Tier", "Czołg MBT", "Niemcy", "Leopard 2A7V", "12.0", "Snajper / Szturm", "Świetna optyka (jeśli max to 12.0)"],
    [12.0, "S-Tier", "Czołg MBT", "USA", "M1A2 SEP V2", "12.0", "Flankowanie", "Znakomity pakiet"],
    [12.0, "A-Tier", "Czołg Lekki", "Rosja", "2S38", "11.3", "Anti-Heli / Flankowanie", "57mm autokanon z amunicją proxy"],
    [12.0, "S-Tier", "SPAA", "Rosja", "Pantsir-S1", "12.0", "Zwalczanie CAS", "Zasięg 20km"],
    [12.0, "A-Tier", "SPAA", "Japonia", "Type 81C", "11.7", "Zwalczanie CAS", "Rakiety IR"],
    [12.0, "A-Tier", "SPAA", "Szwecja", "ItO 90M", "12.0", "Zwalczanie CAS", "Znakomite rakiety"],
    
    # 11.0
    [11.0, "S-Tier", "Czołg MBT", "USA", "M1A1 AIM / Click-Bait", "11.3", "Szturm", "Mocna amunicja"],
    [11.0, "S-Tier", "Czołg MBT", "Rosja", "T-80U-E1", "11.3", "Brawler", "Kontakt-5, zwinność"],
    [11.0, "S-Tier", "Czołg MBT", "Niemcy", "Leopard 2A6", "11.3", "Snajper", "Lufa L/55"],
    [11.0, "S-Tier", "SPAA", "USA", "ADATS", "11.0", "Obrona + Anti-Tank", "Rakiety bezdymne"],
    [11.0, "S-Tier", "SPAA", "Rosja", "Pantsir-S1", "11.0", "Up-tier SPAA", "Zasięg 20km"],

    # 10.0 - 10.3
    [10.0, "S-Tier", "Czołg Lekki", "Rosja", "BMP-2M", "10.0", "Dewastacja z zaskoczenia", "4 rakiety Kornet wystrzeliwane w ruchu"],
    [10.0, "A-Tier", "Czołg MBT", "Niemcy", "Leopard 2A4", "10.3", "Uniwersalny MBT", "Dobra termowizja i mobilność"],
    [10.0, "S-Tier", "Czołg MBT", "Rosja", "T-80B", "10.3", "Brawler", "Pancerz ERA, stabilny autoloader"],
    [10.0, "A-Tier", "Czołg MBT", "Francja", "AMX-40", "10.3", "Agresywny szturm", "Szybki, działo 120mm"],
    [10.0, "S-Tier", "SPAA", "Rosja", "2S6 Tunguska", "10.7", "Parasol Przeciwlotniczy", "8 rakiet SAM + mocne działka 30mm"],
    [10.0, "A-Tier", "SPAA", "USA", "LAV-AD", "10.0", "Mobilna pelotka", "Stinger x8"],

    # 9.0
    [9.0, "S-Tier", "Szturmówka", "USA", "A-10A Early", "9.3", "Mocny CAS", "Działo GAU-8 Avenger"],
    [9.0, "A-Tier", "Czołg MBT", "Niemcy", "Leopard A1A1 (L/44)", "9.0", "Snajper", "Potężne działo 120mm jak na ten BR"],
    [9.0, "S-Tier", "Czołg Lekki", "Niemcy", "Begleitpanzer 57", "9.3", "Niszczenie luf i gąsienic", "Armata 57mm z proxy + TOW"],
    [9.0, "A-Tier", "Czołg MBT", "USA", "XM-1 (Chrysler)", "9.3", "Błyskawiczne flankowanie", "Prototyp M1"],
    [9.0, "A-Tier", "Czołg MBT", "Rosja", "T-64B", "9.0", "Ciężki pancerz", "Kobra ATGM"],
    [9.0, "S-Tier", "SPAA", "Niemcy", "Gepard 1A2", "9.3", "Obrona plot / p-panc", "Zwykły Gepard + Rakiety Stinger"],
    [9.0, "A-Tier", "SPAA", "Wlk. Brytania", "ZA-35", "9.0", "Obrona plot", "Radar 2x35mm"],

    # 8.0 - 8.7
    [8.0, "S-Tier", "Szturmówka", "USA", "A-4B Skyhawk", "8.3", "Zwinny CAS", "Bomby i rakiety"],
    [8.0, "S-Tier", "Szturmówka", "Niemcy", "G.91 R/3", "8.3", "Zwinny CAS", "Rakiety Nord"],
    [8.0, "A-Tier", "Myśliwiec", "Wlk. Brytania", "Scimitar F Mk.1", "8.3", "Szybki", "Dobra ucieczka po ataku"],
    [8.0, "A-Tier", "Bombowiec", "Rosja", "Ił-28", "8.0", "Dywany", "Odrzutowy"],
    [8.0, "S-Tier", "Czołg MBT", "Rosja", "T-55A / IS-7", "8.0 / 8.3", "Ciężki przełom", "Pancerz trudny do przebicia na tym poziomie"],
    [8.0, "S-Tier", "Czołg Lekki", "Rosja", "PT-76-57", "8.7", "Rzeźnik z flanki", "Autoloader 57mm"],
    [8.0, "A-Tier", "Czołg MBT", "Niemcy", "Turm III", "8.7", "Szybki atak", "Armata 105mm i autokanon 30mm"],
    [8.0, "A-Tier", "Czołg MBT", "USA", "M60A1 (AOS) / RISE", "8.7", "Brawler", "Świetna przeżywalność wieży"],
    [8.0, "A-Tier", "Czołg MBT", "Chiny", "ZTZ59D1", "8.3", "Brawler", "Dobra alternatywa"],
    [8.0, "S-Tier", "SPAA", "Niemcy", "Gepard", "8.0", "Obrona plot", "Król pelot na 8.0"],
    [8.0, "A-Tier", "SPAA", "Wlk. Brytania", "Chieftain Marksman", "8.3", "Obrona plot", "Wytrzymała platforma"],

    # 7.0 - 7.3
    [7.0, "S-Tier", "Myśliwiec", "Rosja", "BI", "7.0", "Błyskawiczne przechwytywanie", "Myśliwiec rakietowy, nietykalny"],
    [7.0, "S-Tier", "Szturmówka", "Niemcy", "Ar 234 C-3", "7.0", "Precyzyjny CAS", "Odrzutowiec bombowy"],
    [7.0, "S-Tier", "Czołg MBT", "Rosja", "IS-3", "7.7", "Czołg Ciężki", "Najgrubszy pancerz frontowy"],
    [7.0, "A-Tier", "Czołg MBT", "Rosja", "T-44-100", "7.7", "Flankowanie", "Zwinny, świetna lufa"],
    [7.0, "A-Tier", "Czołg MBT", "USA", "T32 / T29", "7.7", "Snajper zza osłony", "Nieprzebijalna wieża"],
    [7.0, "A-Tier", "Czołg MBT", "Francja", "Lorraine 40t / AMX-50", "7.7", "Atak z zaskoczenia", "Autoloader (oskar)"],
    [7.0, "S-Tier", "SPAA", "Rosja", "ZSU-23-4M2", "7.7", "Shredder przeciwlotniczy", "Szyłka - niszczy wszystko"],
    [7.0, "A-Tier", "SPAA", "Japonia", "HS Typ 99", "7.3", "Przeciwlotnicza zapora", "Zapalniki zbliżeniowe"],

    # 6.0 - 6.7
    [6.0, "S-Tier", "Szturmówka", "Niemcy", "Me 262 A-1/U4", "6.7", "Precyzyjny CAS", "Pojedyncze działo 50mm"],
    [6.0, "S-Tier", "Szturmówka", "USA", "A-1H Skyraider", "6.3", "Dywan", "Ogromny udźwig"],
    [6.0, "A-Tier", "Myśliwiec", "Wlk. Brytania", "Spitfire LF Mk IX", "6.3", "Air Cover", "Zwinny dogfighter"],
    [6.0, "A-Tier", "Bombowiec", "Rosja", "Tu-2S", "6.3", "Dywany", "Szybki dwusilnikowiec"],
    [6.0, "S-Tier", "Bombowiec", "Niemcy", "Ju 288 C", "6.7", "Szybki rajd", "Najlepszy bombowiec w grze na tym BR"],
    [6.0, "S-Tier", "Czołg MBT", "Niemcy", "Tiger II (H) Sla.16", "6.7", "Lider pchnięcia", "Mocne działo 88mm i wspaniały pancerz"],
    [6.0, "A-Tier", "Czołg MBT", "USA", "T26E5", "6.7", "Brawler", "Super-Pershing"],
    [6.0, "A-Tier", "Czołg MBT", "Niemcy", "Panther G / F", "6.3", "Snajper", "Bardzo dobra celność"],
    [6.0, "A-Tier", "Czołg MBT", "Rosja", "T-34-100", "6.7", "Flankowanie", "Działo 100mm"],
    [6.0, "A-Tier", "SPAA", "Niemcy", "Zerstörer 45", "6.3", "Przeciwlotnicza zapora", "2x37mm"],
    [6.0, "A-Tier", "SPAA", "Wlk. Brytania", "Skink", "6.3", "Przeciwlotnicza zapora", "Zamknięty pancerz (odporny na strafing)"],

    # 5.0 - 5.7
    [5.0, "S-Tier", "Myśliwiec", "USA", "F4U-1C Corsair", "5.0", "Air Cover", "4x 20mm"],
    [5.0, "A-Tier", "Myśliwiec", "USA", "P-51D-30 Mustang", "5.3", "Szybki Air Cover", "Zwinny w nurkowaniu"],
    [5.0, "A-Tier", "Myśliwiec", "Rosja", "Yak-3T", "5.0", "Dogfight", "Działo 37mm niszczy jednym strzałem"],
    [5.0, "A-Tier", "Myśliwiec", "Niemcy", "Bf 109 G-14", "5.3", "Przechwytywanie", "Dobry climb rate"],
    [5.0, "S-Tier", "Bombowiec", "Rosja", "Tu-2", "5.3", "Masowe bombardowanie", "Prędkość i ładunek"],
    [5.0, "S-Tier", "Czołg MBT", "Niemcy", "Panther D", "5.7", "Snajper / Dominacja", "Działo L/70"],
    [5.0, "S-Tier", "Czołg MBT", "Niemcy", "Tiger H1 / Ost", "5.7", "Brawler", "Kątowany pancerz"],
    [5.0, "A-Tier", "Czołg MBT", "USA", "M4A3E2 Jumbo", "5.7", "Brawler", "Czołowy pancerz nie do ugryzienia"],
    [5.0, "A-Tier", "Czołg MBT", "Rosja", "T-34-85", "5.7", "Flankowanie", "Znakomity all-rounder"],
    [5.0, "A-Tier", "Czołg MBT", "Niemcy", "VK 3002 (M)", "5.3", "Szybki push", "Prototyp Pantery"],
    [5.0, "A-Tier", "Czołg MBT", "Francja", "M4A4 (SA50) / FL10", "5.3", "Flankowanie", "Autoloader na Shermanie"],
    [5.0, "A-Tier", "Czołg MBT", "Rosja", "KV-85", "5.3", "Brawler", "Dobry pancerz frontowy"],
    [5.0, "S-Tier", "SPAA", "Niemcy", "Ostwind II", "5.3", "Przeciwlotnicza zapora", "Podwójne działo 37mm"],
    [5.0, "A-Tier", "SPAA", "Japonia", "SUB-I-II", "5.7", "Przeciwlotnicza zapora", "20mm auto"],
    [5.0, "A-Tier", "SPAA", "Francja", "AMX-13 DCA 40", "5.3", "Przeciwlotnicza zapora", "Armata 40mm Bofors"],

    # 4.7
    [4.7, "S-Tier", "Myśliwiec", "USA", "F8F-1 Bearcat", "4.7", "Air Cover", "Najszybszy tłokowiec"],
    [4.7, "S-Tier", "Myśliwiec", "Wlk. Brytania", "Spitfire F Mk IX", "4.7", "Dogfight", "Niezwykle zwinny"],
    [4.7, "A-Tier", "Szturmówka", "Rosja", "Su-8", "4.3", "CAS", "Ciężki ładunek"],
    [4.7, "S-Tier", "Czołg MBT", "Rosja", "T-34-57", "4.7", "Flankowanie", "Zabójcze działo 57mm"],
    [4.7, "A-Tier", "Czołg MBT", "USA", "T14", "4.7", "Brawler", "Czołg ciężki"],
    [4.7, "S-Tier", "Czołg MBT", "Rosja", "ISU-152", "4.7", "Niszczyciel", "Zwierzosobnik - 152mm zabija od razu"],
    [4.7, "S-Tier", "SPAA", "USA", "T77E1", "4.7", "Przeciwlotnicza zapora", "6x 12.7mm"],
    [4.7, "A-Tier", "SPAA", "Włochy", "M42 Contraereo", "4.7", "Przeciwlotnicza zapora", "4x 20mm"]
]

for r in data:
    ws.append(r)

# Generate empty placeholder rows for ALL BRs down to 1.0
brs = [14.0, 13.7, 13.3, 13.0, 12.7, 12.3, 11.7, 11.3, 10.7, 10.3, 9.7, 9.3, 8.7, 8.3, 7.7, 7.3, 6.7, 6.3, 5.7, 5.3, 4.3, 4.0, 3.7, 3.3, 3.0, 2.7, 2.3, 2.0, 1.7, 1.3, 1.0]
for b in brs:
    ws.append([b, "", "", "", "", "", "", ""])

# Table Style
tab = Table(displayName="SQB_Meta_Final", ref=f"A1:H{len(data)+len(brs)+1}")
style = TableStyleInfo(name="TableStyleMedium13", showFirstColumn=False, showLastColumn=False, showRowStripes=True, showColumnStripes=False)
tab.tableStyleInfo = style
ws.add_table(tab)

# Apply Widths & Alignments
widths = {'A': 16, 'B': 10, 'C': 18, 'D': 16, 'E': 30, 'F': 16, 'G': 35, 'H': 45}
for col, w in widths.items():
    ws.column_dimensions[col].width = w

center_align = Alignment(horizontal="center", vertical="center")
wrap_align = Alignment(vertical="center", wrap_text=True)

for row in ws.iter_rows(min_row=2, max_col=8):
    row[0].alignment = center_align
    row[1].alignment = center_align
    row[2].alignment = center_align
    row[3].alignment = center_align
    row[4].alignment = wrap_align
    row[5].alignment = center_align
    row[6].alignment = wrap_align
    row[7].alignment = wrap_align

# Conditional formatting
s_fill = PatternFill(start_color="FFD700", end_color="FFD700", fill_type="solid")
a_fill = PatternFill(start_color="C0C0C0", end_color="C0C0C0", fill_type="solid")
ws.conditional_formatting.add('B2:B1000', CellIsRule(operator='equal', formula=['"S-Tier"'], fill=s_fill))
ws.conditional_formatting.add('B2:B1000', CellIsRule(operator='equal', formula=['"A-Tier"'], fill=a_fill))

ws.freeze_panes = "A2"
wb.save(file_path)

# 2. OPEN EXCEL, COPY TO CLIPBOARD, AND INJECT INTO GOOGLE SHEETS
print("Uruchamiam aplikacje Excel w tle do skopiowania formatowania...")
excel = win32com.client.Dispatch("Excel.Application")
excel.Visible = False
workbook = excel.Workbooks.Open(file_path)
worksheet = workbook.ActiveSheet
worksheet.UsedRange.Copy()

print("Otwieram arkusz w przeglądarce...")
google_sheets_url = "https://docs.google.com/spreadsheets/d/1tZzjRk2bs4ZzIXOgRwg26zc3uvOizjKTIC_VdecZOMc/edit?gid=0#gid=0"
webbrowser.open(google_sheets_url)

print("Czekam 12 sekund na pełne załadowanie strony...")
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
else:
    print("Ostrzeżenie: Nie mogłem automatycznie namierzyć okna, kontynuuję.")

time.sleep(1.5)
# Focus cell A1, clear everything, then paste!
pyautogui.hotkey('ctrl', 'home')
time.sleep(0.5)
pyautogui.hotkey('ctrl', 'a')
time.sleep(0.5)
pyautogui.press('delete')
time.sleep(0.5)
pyautogui.hotkey('ctrl', 'home')
time.sleep(0.5)
pyautogui.hotkey('ctrl', 'v')

print("Wklejono bogate formatowanie!")
time.sleep(2)

# Safely close Excel
excel.CutCopyMode = False
workbook.Close(False)
excel.Quit()
