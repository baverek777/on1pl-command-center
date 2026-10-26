import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation

wb = openpyxl.Workbook()
ws = wb.active
ws.title = "Czysta Meta SQB"

headers = ["MAX BR", "Kategoria", "Maszyna", "Rzeczywisty BR", "Nacja", "Uwagi"]
ws.append(headers)

# Data
data = [
    # 14.3
    [14.3, "Myśliwce / Szturmówki", "Eurofighter Typhoon DA", "14.0", "Niemcy", "IRIS-T + Meteor, najlepszy myśliwiec"],
    [14.3, "Myśliwce / Szturmówki", "Rafale C", "14.0", "Francja", "MICA EM/IR, znakomita zwrotność"],
    [14.3, "Myśliwce / Szturmówki", "Su-30SM", "14.0", "Rosja", "R-77-1, świetne CAS"],
    [14.3, "Myśliwce / Szturmówki", "F-15E Strike Eagle", "14.0", "USA", "AIM-120C, top CAS"],
    [14.3, "Myśliwce / Szturmówki", "JAS 39C Gripen", "14.0", "Szwecja", "Najlżejszy i najzwinniejszy"],
    [14.3, "Myśliwce / Szturmówki", "F/A-18C Hornet", "13.7", "USA", "Solidny all-rounder"],
    [14.3, "Helikoptery", "Ka-52", "12.3", "Rosja", "Vikhr ATGM"],
    [14.3, "Helikoptery", "Mi-28NM", "12.3", "Rosja", "LMUR rakiety"],
    [14.3, "Helikoptery", "Z-10ME", "12.3", "Chiny", "HJ-10"],
    [14.3, "Czołgi / MBT", "Strv 122B+", "12.3", "Szwecja", "Idealny 1-life tank"],
    [14.3, "Czołgi / MBT", "Leopard 2A7V", "12.3", "Niemcy", "Najlepszy celownik"],
    [14.3, "Czołgi / MBT", "T-90M", "12.3", "Rosja", "Sztora APS, autoloader"],
    [14.3, "Czołgi / MBT", "M1A2 SEP V2", "12.3", "USA", "TUSK, optyka"],
    [14.3, "Czołgi / MBT", "Type 10", "12.0", "Japonia", "Miniaturyzacja, autoloader"],
    [14.3, "Czołgi / MBT", "Merkava Mk 4M", "12.3", "Izrael", "Trophy APS"],
    [14.3, "Pelotki / SPAA", "Pantsir SM-SV", "12.3", "Rosja", "Nowy system po Ninth Wave"],
    [14.3, "Pelotki / SPAA", "Pantsir-S1", "12.0", "Rosja", "Absolutny king SPAA"],
    [14.3, "Pelotki / SPAA", "ADATS", "11.3", "USA/UK", "8 rakiet dual-role"],
    [14.3, "Pelotki / SPAA", "ItO 90M", "12.0", "Szwecja", "Mistral 3"],
    [14.3, "Pelotki / SPAA", "Type 81C", "11.7", "Japonia", "Rakiety IR (8km)"],
    # 12.0
    [12.0, "Myśliwce / Szturmówki", "JAS 39A Gripen", "12.0", "Szwecja", "AIM-9L, doskonały na ten BR"],
    [12.0, "Myśliwce / Szturmówki", "AV-8B Plus", "12.0", "USA", "AIM-120A, VTOL"],
    [12.0, "Myśliwce / Szturmówki", "Harrier GR.7", "11.7", "Wlk. Brytania", "AGM-65"],
    [12.0, "Helikoptery", "Ka-52", "12.0", "Rosja", "Top klasa"],
    [12.0, "Helikoptery", "AH Mk.1 Apache", "10.7", "Wlk. Brytania", "Hellfire"],
    [12.0, "Czołgi / MBT", "Strv 122A / PLSS", "11.7", "Szwecja", "Top pancerz na tym BR"],
    [12.0, "Czołgi / MBT", "T-80U", "11.3", "Rosja", "Szybki, z dobrym pancerzem"],
    [12.0, "Czołgi / MBT", "Leopard 2A6", "11.7", "Niemcy", "Dobra lufa L/55"],
    [12.0, "Czołgi / MBT", "M1A1 Click-Bait", "11.3", "USA", "Silny backup"],
    [12.0, "Czołgi / MBT", "2S38", "11.3", "Rosja", "Wyjątek (lekkie): zjada helikoptery i flanki"],
    [12.0, "Czołgi / MBT", "Type 10", "12.0", "Japonia", "Topowa przeżywalność przez szybkość"],
    [12.0, "Pelotki / SPAA", "Pantsir-S1", "12.0", "Rosja", "Obowiązkowy"],
    [12.0, "Pelotki / SPAA", "ItO 90M", "12.0", "Szwecja", "Obowiązkowy dla SWE/FR"],
    [12.0, "Pelotki / SPAA", "Type 81C", "11.7", "Japonia", "Znakomity"],
    # 11.0
    [11.0, "Czołgi / MBT", "T-80U-E1", "11.3", "Rosja", "Szybki z dobrą optyką"],
    [11.0, "Czołgi / MBT", "Leopard 2A4", "10.3", "Niemcy", "Podstawa na tym BR"],
    [11.0, "Czołgi / MBT", "M1A1 AIM / Click-Bait", "11.3", "USA", "Najlepszy w USA"],
    [11.0, "Pelotki / SPAA", "ADATS", "11.0", "UK/USA", "Dual-role (ziemia/powietrze)"],
    [11.0, "Pelotki / SPAA", "Pantsir-S1", "12.0", "Rosja", "Jeśli rzuca na up-tier"],
    # 10.0
    [10.0, "Czołgi / MBT", "BMP-2M", "10.0", "Rosja", "Król BR 10.0 - 4 Kornety w ruchu"],
    [10.0, "Czołgi / MBT", "Leopard 2A4", "10.3", "Niemcy", "Podstawa na ten tier"],
    [10.0, "Czołgi / MBT", "T-80B", "10.0", "Rosja", "Kontakt-1, stabilny autoloader"],
    [10.0, "Czołgi / MBT", "AMX-40", "10.0", "Francja", "Wysoka mobilność, działo 120mm"],
    [10.0, "Pelotki / SPAA", "2S6 Tunguska", "10.0", "Rosja", "Obowiązkowy SPAA"],
    [10.0, "Pelotki / SPAA", "LAV-AD", "10.0", "USA", "8x Stinger, Hydra"],
    # 9.0
    [9.0, "Myśliwce / Szturmówki", "A-10A Early", "9.3", "USA", "Najlepszy CAS (wymaga czystego nieba)"],
    [9.0, "Czołgi / MBT", "Leopard A1A1 (L/44)", "9.0", "Niemcy", "Armata 120mm i termowizja"],
    [9.0, "Czołgi / MBT", "Begleitpanzer 57", "9.3", "Niemcy", "Wyjątek: niszczyciel luf i helek"],
    [9.0, "Czołgi / MBT", "XM-1 (Chrysler)", "9.3", "USA", "Świetna mobilność dla flankowania"],
    [9.0, "Czołgi / MBT", "T-64B", "9.0", "Rosja", "Ciężki pancerz dla tej ery, Kobra ATGM"],
    [9.0, "Pelotki / SPAA", "Gepard 1A2", "9.3", "Niemcy", "Dodatkowe rakiety Stinger"],
    [9.0, "Pelotki / SPAA", "ZA-35", "9.0", "Wlk. Brytania", "Znakomity radarowy SPAA"],
    # 8.0
    [8.0, "Myśliwce / Szturmówki", "A-4B Skyhawk", "8.3", "USA", "Dobry ładunek na ten BR"],
    [8.0, "Myśliwce / Szturmówki", "G.91 R/3", "8.3", "Niemcy", "Rakiety Nord do zabijania ciężkich czołgów"],
    [8.0, "Czołgi / MBT", "T-55A / IS-7", "8.0", "Rosja", "Bardzo trudne do przebicia od frontu"],
    [8.0, "Czołgi / MBT", "PT-76-57", "8.7", "Rosja", "Zabójcza seria 57mm z boku"],
    [8.0, "Czołgi / MBT", "Turm III", "8.7", "Niemcy", "Autoloader z dwuosiową stabilizacją"],
    [8.0, "Czołgi / MBT", "M60A1 (AOS) / RISE", "8.7", "USA", "Świetna przeżywalność wieży"],
    [8.0, "Pelotki / SPAA", "Gepard", "8.0", "Niemcy", "Perfekcyjny na 8.0"],
    [8.0, "Pelotki / SPAA", "ZA-35", "8.3", "Wlk. Brytania", "Świetna alternatywa"],
    [8.0, "Pelotki / SPAA", "Chieftain Marksman", "8.3", "Wlk. Brytania", "Działa 35mm"],
    # 7.0
    [7.0, "Myśliwce / Szturmówki", "BI", "7.0", "Rosja", "Unikalny myśliwiec rakietowy, nietykalny"],
    [7.0, "Myśliwce / Szturmówki", "Ar 234 C-3", "7.0", "Niemcy", "Odrzutowiec bombowy"],
    [7.0, "Czołgi / MBT", "IS-3", "7.7", "Rosja", "Najpotężniejszy pancerz frontowy"],
    [7.0, "Czołgi / MBT", "T-44-100", "7.7", "Rosja", "Zwinny i zabójczy z profilu bocznego"],
    [7.0, "Czołgi / MBT", "T32 / T29", "7.0 / 7.7", "USA", "Wieże niemożliwe do przebicia z daleka"],
    [7.0, "Czołgi / MBT", "Lorraine 40t / AMX-50", "7.7", "Francja", "Autoloader oskar"],
    [7.0, "Pelotki / SPAA", "ZSU-23-4M2", "7.7", "Rosja", "Szyłka, najlepszy shredder"],
    [7.0, "Pelotki / SPAA", "HS Typ 99", "7.3", "Japonia", "Zapalniki zbliżeniowe przeciw lotnictwu!"],
    # 6.0
    [6.0, "Myśliwce / Szturmówki", "Me 262 A-1/U4", "6.7", "Niemcy", "Działo 50mm, super CAS"],
    [6.0, "Myśliwce / Szturmówki", "A-1H Skyraider", "6.3", "USA", "Bardzo dużo bomb na pylonach"],
    [6.0, "Myśliwce / Szturmówki", "Spitfire LF Mk IX", "6.3", "Wlk. Brytania", "Świetny dogfighter"],
    [6.0, "Bombowce", "Tu-2S", "6.3", "Rosja", "Szybki dwusilnikowiec z dużym ładunkiem"],
    [6.0, "Bombowce", "Ju 288 C", "6.7", "Niemcy", "Najlepszy bombowiec 2 WŚ w grze"],
    [6.0, "Czołgi / MBT", "Tiger II (H) Sla.16", "6.7", "Niemcy", "Topowy Niemiecki Heavy"],
    [6.0, "Czołgi / MBT", "T26E5", "6.7", "USA", "Super pancerz przedni"],
    [6.0, "Czołgi / MBT", "Panther G / F", "6.3 / 6.7", "Niemcy", "Doskonała mobilność i armata"],
    [6.0, "Czołgi / MBT", "T-34-100", "6.7", "Rosja", "Mobilność T-34 + siła IS-2"],
    [6.0, "Pelotki / SPAA", "Zerstörer 45", "6.3", "Niemcy", "Brak wieży, ale 2x37mm miażdży"],
    [6.0, "Pelotki / SPAA", "Skink", "6.3", "Wlk. Brytania", "Zabudowany, odporny na strafing"],
    # 5.0
    [5.0, "Myśliwce / Szturmówki", "F4U-1C Corsair", "5.0", "USA", "4x 20mm"],
    [5.0, "Myśliwce / Szturmówki", "Yak-3T", "5.0", "Rosja", "Zwrotny, działo 37mm zabija od razu"],
    [5.0, "Myśliwce / Szturmówki", "Bf 109 G-14", "5.3", "Niemcy", "Klasyk do air cover"],
    [5.0, "Bombowce", "Tu-2", "5.3", "Rosja", "Niezrównany na tym etapie"],
    [5.0, "Czołgi / MBT", "Panther D", "5.7", "Niemcy", "Pancerz odbijający 85mm, L/70"],
    [5.0, "Czołgi / MBT", "Tiger H1 / Ost", "5.7", "Niemcy", "Kątowany pancerz nie wybacza"],
    [5.0, "Czołgi / MBT", "M4A3E2 Jumbo", "5.7", "USA", "Czysty pancerz"],
    [5.0, "Czołgi / MBT", "T-34-85", "5.7", "Rosja", "Najbardziej uniwersalny średni"],
    [5.0, "Czołgi / MBT", "M4A4 (SA50) / FL10", "5.3", "Francja", "Autoloader i penetracja"],
    [5.0, "Pelotki / SPAA", "Ostwind II", "5.3", "Niemcy", "2x 37mm, świetna zapora ogniowa"],
    [5.0, "Pelotki / SPAA", "AMX-13 DCA 40", "5.3", "Francja", "Szybki, armata 40mm"],
    [5.0, "Pelotki / SPAA", "SUB-I-II", "5.7", "Japonia", "Podwójne działko 20mm"]
]

for row in data:
    ws.append(row)

# Styling
header_fill = PatternFill(start_color="1A365D", end_color="1A365D", fill_type="solid")
header_font = Font(color="FFFFFF", bold=True, size=12)
center_align = Alignment(horizontal="center", vertical="center")
wrap_align = Alignment(vertical="center", wrap_text=True)
thin_border = Border(
    left=Side(style='thin', color="A0A0A0"), 
    right=Side(style='thin', color="A0A0A0"), 
    top=Side(style='thin', color="A0A0A0"), 
    bottom=Side(style='thin', color="A0A0A0")
)

for cell in ws[1]:
    cell.fill = header_fill
    cell.font = header_font
    cell.alignment = center_align
    cell.border = thin_border

# Zastosowanie do reszty
for row in ws.iter_rows(min_row=2):
    for idx, cell in enumerate(row):
        cell.border = thin_border
        if idx in [0, 3]: 
            cell.alignment = center_align
        else:
            cell.alignment = wrap_align

# Ustalenie szerokości kolumn i filtry
ws.freeze_panes = "A2"
ws.column_dimensions['A'].width = 12
ws.column_dimensions['B'].width = 25
ws.column_dimensions['C'].width = 30
ws.column_dimensions['D'].width = 16
ws.column_dimensions['E'].width = 16
ws.column_dimensions['F'].width = 50

# Data validations
dv_br = DataValidation(type="list", formula1='"14.3, 12.0, 11.0, 10.0, 9.0, 8.0, 7.0, 6.0, 5.0"', allow_blank=True)
ws.add_data_validation(dv_br)
dv_br.add('A2:A2000')

dv_cat = DataValidation(type="list", formula1='"Myśliwce / Szturmówki, Helikoptery, Czołgi / MBT, Pelotki / SPAA, Bombowce"', allow_blank=True)
ws.add_data_validation(dv_cat)
dv_cat.add('B2:B2000')

ws.auto_filter.ref = f"A1:F{len(data)+1}"

file_path = "c:\\Antygravity\\Meta_SQB_Sezon_2026.xlsx"
wb.save(file_path)
print(f"Zapisano plik {file_path}")
