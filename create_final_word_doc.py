
import pandas as pd
import matplotlib.pyplot as plt
from pandas.plotting import table
from docx import Document
from docx.shared import Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
import os

# --- Visualization Function ---
def save_table_image(df, filename, title=None):
    # Setup plot size based on rows
    rows = len(df)
    # Base height + row height, capped at reasonable size
    fig_height = min(rows * 0.4 + 1.5, 10) 
    fig, ax = plt.subplots(figsize=(11, fig_height))
    ax.axis('off')
    
    if title:
        plt.title(title, fontsize=14, pad=10, fontweight='bold', fontfamily='Arial')
    
    # Create table
    tbl = table(ax, df, loc='center', cellLoc='center', colWidths=[1.0/len(df.columns)]*len(df.columns))
    tbl.auto_set_font_size(False)
    tbl.set_fontsize(9)
    tbl.scale(1.2, 1.4)
    
    # Styling
    for k, cell in tbl.get_celld().items():
        cell.set_edgecolor('#A0A0A0')
        cell.set_text_props(fontfamily='Arial')
        if k[0] == 0: # Header
            cell.set_text_props(weight='bold', color='white')
            cell.set_facecolor('#4472C4') # Word Blue
        else:
            if k[0] % 2 == 0:
                cell.set_facecolor('#D9E1F2') # Light Blue stripe
            else:
                cell.set_facecolor('#FFFFFF')
    
    plt.tight_layout()
    plt.savefig(filename, bbox_inches='tight', dpi=150)
    plt.close()

def main():
    excel_file = "V.16.1 Rekrutacja.xlsx"
    if not os.path.exists(excel_file):
        print(f"Error: {excel_file} not found. Please ensure the file is in the folder.")
        return

    print(f"Reading data from {excel_file}...")
    try:
        df = pd.read_excel(excel_file)
    except:
        # Try reading without header or specific sheet if default fails
        df = pd.read_excel(excel_file, sheet_name=0)

    # Clean column names just in case (strip whitespace)
    df.columns = df.columns.str.strip()
    
    # Verify columns exist
    required_cols = ['Nazwisko', 'Płeć', 'Egz. h', 'Egz. je', 'Gimnazjum macierzyste']
    for col in required_cols:
        if col not in df.columns:
            # Try to find fuzzy match
            for existing in df.columns:
                if col.lower() in existing.lower():
                    df.rename(columns={existing: col}, inplace=True)
    
    doc = Document()
    
    # Title
    title_p = doc.add_heading('Rozwiązania Zadań - Operacje Bazodanowe', 0)
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    doc.add_paragraph('Poniższy dokument przedstawia rozwiązania zadań z arkusza rekrutacyjnego zgodnie z instrukcją.')

    # --- I. Sortowanie ---
    doc.add_heading('1. Sortowanie', level=1)
    doc.add_paragraph('Zadanie: Posortować tabelę według kolumny "Egz. h" (wynik humanistyczny) malejąco (od największych).')
    
    if 'Egz. h' in df.columns:
        sorted_df = df.sort_values(by='Egz. h', ascending=False)
        img1 = "z1_sortowanie.png"
        save_table_image(sorted_df.head(15), img1, title="Wynik sortowania (Top 15)")
        doc.add_picture(img1, width=Inches(6.5))
        doc.add_paragraph('Rys. 1. Fragment tabeli po posortowaniu malejąco wg Egz. h.')
    else:
        doc.add_paragraph('BŁĄD: Brak kolumny Egz. h w pliku.')

    doc.add_page_break()

    # --- II. Filtrowanie ---
    doc.add_heading('2. Filtrowanie', level=1)
    
    # 2a
    doc.add_heading('A. Tylko kobiety', level=2)
    if 'Płeć' in df.columns:
        df_women = df[df['Płeć'].astype(str).str.upper() == 'K']
        img2a = "z2a_kobiety.png"
        save_table_image(df_women.head(10), img2a, title="Filtr: Płeć = K")
        doc.add_picture(img2a, width=Inches(6.5))
        doc.add_paragraph('Tabela wyświetla tylko rekordy, gdzie Płeć to "K".')
    
    # 2b
    doc.add_heading('B. Kobiety o nazwisku na "B"', level=2)
    if 'Nazwisko' in df.columns and 'Płeć' in df.columns:
        df_women_b = df_women[df_women['Nazwisko'].astype(str).str.startswith('B')]
        img2b = "z2b_kobiety_B.png"
        save_table_image(df_women_b.head(10), img2b, title="Filtr: Kobiety + Nazwisko na 'B'")
        doc.add_picture(img2b, width=Inches(6.5))
        doc.add_paragraph('Dodatkowy filtr tekstu: Nazwisko zaczyna się od "B".')
    
    doc.add_page_break()
    
    # 2c
    doc.add_heading('C. Gimnazjum I lub V', level=2)
    if 'Gimnazjum macierzyste' in df.columns:
        # Normalize to string to handle mixed types
        df['Gimnazjum macierzyste'] = df['Gimnazjum macierzyste'].astype(str)
        df_gim = df[df['Gimnazjum macierzyste'].isin(['I', 'V'])]
        img2c = "z2c_gimnazja.png"
        save_table_image(df_gim.head(10), img2c, title="Filtr: Gimnazjum I lub V")
        doc.add_picture(img2c, width=Inches(6.5))
        doc.add_paragraph('Filtr listy: Gimnazjum macierzyste równa się "I" LUB "V".')
    
    # 2d
    doc.add_heading('D. Egzamin język obcy >= 25 pkt', level=2)
    col_je = 'Egz. je' 
    # Check current columns if exact name mismatches slightly
    for c in df.columns:
        if 'je' in c.lower() and 'egz' in c.lower():
            col_je = c
            break
            
    if col_je in df.columns:
        df_lang = df[df[col_je] >= 25]
        img2d = "z2d_jezyk_pkt.png"
        save_table_image(df_lang.head(10), img2d, title=f"Filtr: {col_je} >= 25")
        doc.add_picture(img2d, width=Inches(6.5))
        doc.add_paragraph(f'Filtr liczb: {col_je} większe lub równe 25.')

    doc.add_page_break()

    # --- III. Tabele Przestawne ---
    doc.add_heading('3. Tabele Przestawne', level=1)
    
    # 3a
    doc.add_heading('A. Średnia punktów (Egz. h) dla gimnazjów', level=2)
    if 'Gimnazjum macierzyste' in df.columns and 'Egz. h' in df.columns:
        pivot1 = df.pivot_table(
            index='Gimnazjum macierzyste', 
            values='Egz. h', 
            aggfunc='mean'
        ).round(2)
        # Rename column for clarity in display
        pivot1.columns = ['Średnia z Egz. h']
        
        img3a = "z3a_przestawna_srednia.png"
        save_table_image(pivot1.reset_index(), img3a, title="Średnia Egz. h wg Gimnazjum")
        doc.add_picture(img3a, width=Inches(6.5))
        doc.add_paragraph('Tabela przestawna grupująca po Gimnazjum i obliczająca średnią z wyników humanistycznych.')

    # 3b
    doc.add_heading('B. Procent uczniów wg języka', level=2)
    col_lang = 'Pierwszy język'
    # Fallback search
    for c in df.columns:
        if 'język' in c.lower():
            col_lang = c
            break
            
    if col_lang in df.columns:
        # Value counts as percentage
        pivot2 = df[col_lang].value_counts(normalize=True).mul(100).round(2).to_frame(name='% Uczniów')
        pivot2.index.name = 'Język'
        
        img3b = "z3b_przestawna_procent.png"
        save_table_image(pivot2.reset_index(), img3b, title="Struktura języków (%)")
        doc.add_picture(img3b, width=Inches(6.5))
        doc.add_paragraph('Tabela przedstawiająca jaki procent uczniów wybrał dany język jako pierwszy.')

    # Save
    output_docx = "Zadania_Rozwiazane_Final.docx"
    doc.save(output_docx)
    print(f"DONE: Word document saved to {output_docx}")

if __name__ == "__main__":
    main()
