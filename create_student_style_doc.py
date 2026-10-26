
import pandas as pd
import matplotlib.pyplot as plt
from pandas.plotting import table
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
import os

# --- Visualization Function (Excel Style) ---
def save_excel_style_image(df, filename, title=None):
    # Setup plot size
    rows = len(df)
    fig_height = min(rows * 0.35 + 1.0, 10) 
    fig, ax = plt.subplots(figsize=(10, fig_height))
    ax.axis('off')
    
    if title:
        plt.title(title, fontsize=11, loc='left', pad=10, fontfamily='Calibri')
    
    # Create table
    tbl = table(ax, df, loc='center', cellLoc='left', colWidths=[1.0/len(df.columns)]*len(df.columns))
    tbl.auto_set_font_size(False)
    tbl.set_fontsize(10)
    tbl.scale(1.2, 1.2)
    
    # Excel-like Styling
    for k, cell in tbl.get_celld().items():
        cell.set_edgecolor('#D4D4D4') # Light grey grid
        cell.set_text_props(fontfamily='Calibri')
        cell.set_linewidth(0.5)
        
        if k[0] == 0: # Header
            cell.set_text_props(weight='bold', color='black')
            cell.set_facecolor('#F2F2F2') # Light grey header
            cell.set_text_props(ha='center')
        else:
            cell.set_facecolor('#FFFFFF') # White cells
            # cell.set_text_props(ha='left') # Align text left like Excel usually does for text
            
            # Simple alternating check or just plain white
            # if k[0] % 2 == 0: cell.set_facecolor('#FAFAFA')

    plt.tight_layout()
    plt.savefig(filename, bbox_inches='tight', dpi=120)
    plt.close()

def main():
    excel_file = "V.16.1 Rekrutacja.xlsx"
    if not os.path.exists(excel_file):
        print(f"Error: {excel_file} not found.")
        return

    try:
        df = pd.read_excel(excel_file)
    except:
        df = pd.read_excel(excel_file, sheet_name=0)

    # Clean columns
    df.columns = df.columns.str.strip()
    
    # Determine columns safely
    col_dict = {}
    for col in df.columns:
        c_low = col.lower()
        if 'imię' in c_low: col_dict['imie'] = col
        elif 'nazwisko' in c_low: col_dict['nazwisko'] = col
        elif 'płeć' in c_low: col_dict['plec'] = col
        elif 'gimnazjum' in c_low: col_dict['gimnazjum'] = col
        elif 'egz. h' in c_low: col_dict['egz_h'] = col
        elif 'egz. je' in c_low: col_dict['egz_je'] = col
        elif 'pierwszy' in c_low: col_dict['jezyk'] = col

    doc = Document()
    
    # Styl - totalny brak stylu
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Calibri'
    font.size = Pt(11)

    # Title - po prostu tekst
    doc.add_paragraph('Rozwiązania')
    doc.add_paragraph('') 

    # --- 1. Sortowanie ---
    doc.add_paragraph('1. Sortowanie')
    
    if 'egz_h' in col_dict:
        sorted_df = df.sort_values(by=col_dict['egz_h'], ascending=False)
        img1 = "z1_sort.png"
        cols_to_show = [col_dict.get('nazwisko', 'Nazwisko'), col_dict['egz_h'], col_dict.get('gimnazjum', 'Gimnazjum')]
        cols_to_show = [c for c in cols_to_show if c in df.columns]
        save_excel_style_image(sorted_df[cols_to_show].head(10), img1)
        doc.add_picture(img1, width=Inches(5))
    
    doc.add_paragraph('')

    # --- 2. Filtrowanie ---
    doc.add_paragraph('2. Filtrowanie')
    
    doc.add_paragraph('a) Kobiety')
    if 'plec' in col_dict:
        df_k = df[df[col_dict['plec']].astype(str).str.upper() == 'K']
        img2a = "z2a_k.png"
        save_excel_style_image(df_k[[col_dict.get('nazwisko','Nazwisko'), col_dict['plec']]].head(8), img2a)
        doc.add_picture(img2a, width=Inches(4))

    doc.add_paragraph('b) Kobiety na B')
    if 'nazwisko' in col_dict and 'plec' in col_dict:
        df_kb = df_k[df_k[col_dict['nazwisko']].astype(str).str.startswith('B')]
        img2b = "z2b_k_b.png"
        save_excel_style_image(df_kb[[col_dict['nazwisko'], col_dict['plec']]].head(8), img2b)
        doc.add_picture(img2b, width=Inches(4))

    doc.add_page_break()

    doc.add_paragraph('c) Gimnazjum I lub V')
    if 'gimnazjum' in col_dict:
        df['temp_gim'] = df[col_dict['gimnazjum']].astype(str)
        df_gim = df[df['temp_gim'].isin(['I', 'V'])]
        img2c = "z2c_gim.png"
        save_excel_style_image(df_gim[[col_dict['nazwisko'], col_dict['gimnazjum']]].head(8), img2c)
        doc.add_picture(img2c, width=Inches(4))

    doc.add_paragraph('d) Język > 25')
    if 'egz_je' in col_dict:
        df_je = df[df[col_dict['egz_je']] >= 25]
        img2d = "z2d_je.png"
        save_excel_style_image(df_je[[col_dict['nazwisko'], col_dict['egz_je']]].head(8), img2d)
        doc.add_picture(img2d, width=Inches(4))
        
    doc.add_paragraph('')

    # --- 3. Tabele Przestawne ---
    doc.add_paragraph('3. Tabele przestawne')
    
    doc.add_paragraph('a) Średnia')
    if 'gimnazjum' in col_dict and 'egz_h' in col_dict:
        pivot1 = df.pivot_table(index=col_dict['gimnazjum'], values=col_dict['egz_h'], aggfunc='mean').round(2)
        img3a = "z3a_pi.png"
        save_excel_style_image(pivot1.reset_index(), img3a)
        doc.add_picture(img3a, width=Inches(4))
        
    doc.add_paragraph('')

    doc.add_paragraph('b) Procenty')
    if 'jezyk' in col_dict:
        pivot2 = df[col_dict['jezyk']].value_counts(normalize=True).mul(100).round(2).to_frame(name='%')
        img3b = "z3b_pi.png"
        save_excel_style_image(pivot2.reset_index(), img3b)
        doc.add_picture(img3b, width=Inches(4))

    output_docx = "Zadania_Ultra_Proste.docx"
    doc.save(output_docx)
    print(f"DONE: {output_docx}")

if __name__ == "__main__":
    main()
