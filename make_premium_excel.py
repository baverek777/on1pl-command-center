import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.worksheet.table import Table, TableStyleInfo
from openpyxl.formatting.rule import CellIsRule
import os

wb = openpyxl.Workbook()
ws = wb.active
ws.title = "Czysta Meta SQB Premium"

headers = ["Tydzień BR", "Tier", "Kategoria", "Nacja", "Maszyna", "Rzeczywisty BR", "Zadanie Taktyczne", "Główny Atut / Uzbrojenie"]
ws.append(headers)

data = [
    [14.3, "S-Tier", "Myśliwiec", "Niemcy", "Eurofighter Typhoon DA", 14.0, "Przechwytywanie (CAP)", "IRIS-T + Meteor"],
    [14.3, "S-Tier", "Myśliwiec", "Francja", "Rafale C", 14.0, "Dogfight / CAP", "MICA EM/IR"],
    [14.3, "S-Tier", "Szturmówka", "Rosja", "Su-30SM", 14.0, "CAS / CAP", "R-77-1"],
    [14.3, "S-Tier", "Szturmówka", "USA", "F-15E Strike Eagle", 14.0, "CAS", "AIM-120C, duży ładunek"],
    [14.3, "S-Tier", "Myśliwiec", "Szwecja", "JAS 39C Gripen", 14.0, "CAP", "Najlżejszy i najzwinniejszy"],
    [14.3, "A-Tier", "Myśliwiec", "USA", "F/A-18C Hornet", 13.7, "Multi-role", "AIM-120A"],
    [14.3, "S-Tier", "Helikopter", "Rosja", "Ka-52", 12.3, "Zwalczanie czołgów z dystansu", "Vikhr ATGM"],
    [14.3, "S-Tier", "Helikopter", "Rosja", "Mi-28NM", 12.3, "Zwalczanie z ukrycia", "Rakiety LMUR"],
    [14.3, "A-Tier", "Helikopter", "Chiny", "Z-10ME", 12.3, "Wsparcie z powietrza", "HJ-10"],
    [14.3, "S-Tier", "Czołg MBT", "Szwecja", "Strv 122B+", 12.3, "Brawler / Szturm", "Najlepszy pancerz kompozytowy"],
    [14.3, "S-Tier", "Czołg MBT", "Niemcy", "Leopard 2A7V", 12.3, "Snajper / Szturm", "Doskonały celownik termowizyjny"],
    [14.3, "S-Tier", "Czołg MBT", "Rosja", "T-90M", 12.3, "Push punktu", "Sztora APS, Autoloader"],
    [14.3, "A-Tier", "Czołg MBT", "USA", "M1A2 SEP V2", 12.3, "Flankowanie", "Pakiet TUSK, optyka"],
    [14.3, "A-Tier", "Czołg MBT", "Japonia", "Type 10", 12.0, "Agresywne flankowanie", "Szybki autoloader"],
    [14.3, "S-Tier", "Czołg MBT", "Izrael", "Merkava Mk 4M", 12.3, "Defensywa", "Trophy APS (aktywny pancerz)"],
    [14.3, "S-Tier", "SPAA", "Rosja", "Pantsir SM-SV", 12.3, "Parasol Przeciwlotniczy", "Nowy system rakietowy"],
    [14.3, "S-Tier", "SPAA", "Rosja", "Pantsir-S1", 12.0, "Parasol Przeciwlotniczy", "2x30mm + 12 rakiet"],
    [14.3, "S-Tier", "SPAA", "USA", "ADATS", 11.3, "Dual-role (Lotnictwo + Czołgi)", "8 potężnych rakiet ATGM/SAM"],
    [14.3, "A-Tier", "SPAA", "Szwecja", "ItO 90M", 12.0, "Czyste SPAA", "Rakiety Mistral 3"],
    [14.3, "A-Tier", "SPAA", "Japonia", "Type 81C", 11.7, "Czyste SPAA", "Rakiety IR"],
    [12.0, "S-Tier", "Myśliwiec", "Szwecja", "JAS 39A Gripen", 12.0, "Przechwytywanie", "AIM-9L"],
    [12.0, "A-Tier", "Szturmówka", "USA", "AV-8B Plus", 12.0, "CAS / VTOL", "AIM-120A"],
    [12.0, "S-Tier", "Helikopter", "Rosja", "Ka-52", 12.0, "Zwalczanie czołgów", "Najlepszy na swoim BR"],
    [12.0, "S-Tier", "Czołg MBT", "Szwecja", "Strv 122A / PLSS", 11.7, "Szturm", "Dominacja pancerza na tym BR"],
    [12.0, "A-Tier", "Czołg Lekki", "Rosja", "2S38", 11.3, "Anti-Heli / Flankowanie", "57mm autokanon z amunicją proxy"],
    [12.0, "S-Tier", "SPAA", "Rosja", "Pantsir-S1", 12.0, "Zwalczanie CAS", "Zasięg 20km"],
    [11.0, "S-Tier", "Czołg MBT", "USA", "M1A1 AIM / Click-Bait", 11.3, "Szturm", "Mocna amunicja"],
    [11.0, "S-Tier", "Czołg MBT", "Rosja", "T-80U-E1", 11.3, "Brawler", "Kontakt-5, zwinność"],
    [11.0, "S-Tier", "Czołg MBT", "Niemcy", "Leopard 2A6", 11.3, "Snajper", "Lufa L/55"],
    [11.0, "S-Tier", "SPAA", "Wlk. Brytania", "ADATS (M113)", 11.0, "Obrona + Anti-Tank", "Rakiety bezdymne"],
    [10.0, "S-Tier", "Czołg Lekki", "Rosja", "BMP-2M", 10.0, "Dewastacja z zaskoczenia", "4 rakiety Kornet wystrzeliwane w ruchu"],
    [10.0, "A-Tier", "Czołg MBT", "Niemcy", "Leopard 2A4", 10.3, "Uniwersalny MBT", "Dobra termowizja i mobilność"],
    [10.0, "S-Tier", "Czołg MBT", "Rosja", "T-80B", 10.0, "Brawler", "Pancerz ERA, stabilny autoloader"],
    [10.0, "S-Tier", "SPAA", "Rosja", "2S6 Tunguska", 10.0, "Parasol Przeciwlotniczy", "8 rakiet SAM + mocne działka 30mm"],
    [9.0, "S-Tier", "Szturmówka", "USA", "A-10A Early", 9.3, "Mocny CAS", "Działo GAU-8 Avenger"],
    [9.0, "S-Tier", "Czołg Lekki", "Niemcy", "Begleitpanzer 57", 9.3, "Niszczenie luf i gąsienic", "Armata 57mm z proxy + TOW"],
    [9.0, "A-Tier", "Czołg MBT", "Niemcy", "Leopard A1A1 (L/44)", 9.0, "Snajper", "Potężne działo 120mm jak na ten BR"],
    [9.0, "S-Tier", "SPAA", "Niemcy", "Gepard 1A2", 9.3, "Obrona plot / p-panc", "Zwykły Gepard + Rakiety Stinger"],
    [8.0, "S-Tier", "Czołg MBT", "Rosja", "T-55A / IS-7", 8.0, "Ciężki przełom", "Pancerz trudny do przebicia na tym poziomie"],
    [8.0, "S-Tier", "Czołg Lekki", "Rosja", "PT-76-57", 8.7, "Rzeźnik z flanki", "Autoloader 57mm"],
    [8.0, "A-Tier", "Czołg MBT", "Niemcy", "Turm III", 8.7, "Szybki atak", "Armata 105mm i autokanon 30mm"],
    [8.0, "S-Tier", "SPAA", "Niemcy", "Gepard", 8.0, "Obrona plot", "Król pelot na 8.0"],
    [7.0, "S-Tier", "Myśliwiec", "Rosja", "BI", 7.0, "Błyskawiczne przechwytywanie", "Myśliwiec rakietowy, nietykalny"],
    [7.0, "S-Tier", "Czołg MBT", "Rosja", "IS-3", 7.7, "Czołg Ciężki", "Pancerz frontowy wytrzymuje prawie wszystko"],
    [7.0, "A-Tier", "Czołg MBT", "USA", "T32 / T29", 7.7, "Snajper zza osłony", "Nieprzebijalna wieża"],
    [7.0, "S-Tier", "SPAA", "Rosja", "ZSU-23-4M2", 7.7, "Shredder przeciwlotniczy", "Szyłka - niszczy wszystko na bliski dystans"],
    [6.0, "S-Tier", "Szturmówka", "Niemcy", "Me 262 A-1/U4", 6.7, "Precyzyjny CAS", "Pojedyncze działo 50mm"],
    [6.0, "S-Tier", "Czołg MBT", "Niemcy", "Tiger II (H) Sla.16", 6.7, "Lider pchnięcia", "Mocne działo 88mm i wspaniały pancerz"],
    [6.0, "A-Tier", "Czołg MBT", "USA", "T26E5", 6.7, "Brawler", "Super-Pershing"],
    [5.0, "S-Tier", "Bombowiec", "Rosja", "Tu-2S", 5.7, "Masowe bombardowanie", "Prędkość i ładunek"],
    [5.0, "S-Tier", "Czołg MBT", "Niemcy", "Panther D", 5.7, "Snajper / Dominacja", "Działo L/70 z ekstremalną penetracją"],
    [5.0, "A-Tier", "Czołg MBT", "USA", "M4A3E2 Jumbo", 5.7, "Brawler", "Czołowy pancerz nie do ugryzienia"],
    [5.0, "S-Tier", "SPAA", "Niemcy", "Ostwind II", 5.3, "Przeciwlotnicza zapora", "Podwójne działo 37mm"]
]

for r in data:
    ws.append(r)

# Empty rows for all BRs
brs = [14.0, 13.7, 13.3, 13.0, 12.7, 12.3, 11.7, 11.3, 10.7, 10.3, 9.7, 9.3, 8.7, 8.3, 7.7, 7.3, 6.7, 6.3, 5.7, 5.3, 4.7, 4.3, 4.0, 3.7, 3.3, 3.0, 2.7, 2.3, 2.0, 1.7, 1.3, 1.0]
for b in brs:
    ws.append([b, "", "", "", "", "", "", ""])

# Apply Table Style (this gives beautiful alternating colors and filters)
tab = Table(displayName="MetySQB", ref=f"A1:H{len(data)+len(brs)+1}")
style = TableStyleInfo(name="TableStyleMedium13", showFirstColumn=False, showLastColumn=False, showRowStripes=True, showColumnStripes=False)
tab.tableStyleInfo = style
ws.add_table(tab)

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

# Tiers conditional formatting
s_fill = PatternFill(start_color="FFD700", end_color="FFD700", fill_type="solid")
a_fill = PatternFill(start_color="C0C0C0", end_color="C0C0C0", fill_type="solid")
ws.conditional_formatting.add('B2:B1000', CellIsRule(operator='equal', formula=['"S-Tier"'], fill=s_fill))
ws.conditional_formatting.add('B2:B1000', CellIsRule(operator='equal', formula=['"A-Tier"'], fill=a_fill))

# Validations
dv_br = DataValidation(type="list", formula1='"14.3, 14.0, 13.7, 13.3, 13.0, 12.7, 12.3, 12.0, 11.7, 11.3, 11.0, 10.7, 10.3, 10.0, 9.7, 9.3, 9.0, 8.7, 8.3, 8.0, 7.7, 7.3, 7.0, 6.7, 6.3, 6.0, 5.7, 5.3, 5.0, 4.7, 4.3, 4.0, 3.7, 3.3, 3.0, 2.7, 2.3, 2.0, 1.7, 1.3, 1.0"', allow_blank=True)
ws.add_data_validation(dv_br)
dv_br.add('A2:A2000')

dv_tier = DataValidation(type="list", formula1='"S-Tier, A-Tier, B-Tier"', allow_blank=True)
ws.add_data_validation(dv_tier)
dv_tier.add('B2:B2000')

dv_cat = DataValidation(type="list", formula1='"Myśliwiec, Szturmówka, Helikopter, Bombowiec, Czołg MBT, Czołg Lekki, SPAA"', allow_blank=True)
ws.add_data_validation(dv_cat)
dv_cat.add('C2:C2000')

dv_nation = DataValidation(type="list", formula1='"USA, Niemcy, Rosja, Wlk. Brytania, Japonia, Chiny, Włochy, Francja, Szwecja, Izrael"', allow_blank=True)
ws.add_data_validation(dv_nation)
dv_nation.add('D2:D2000')

ws.freeze_panes = "A2"

# Save
wb.save("c:\\Antygravity\\Meta_SQB_Premium.xlsx")
