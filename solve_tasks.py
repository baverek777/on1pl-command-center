
import pandas as pd
import matplotlib.pyplot as plt
from pandas.plotting import table
from docx import Document
from docx.shared import Inches
import os

# Set style
plt.style.use('ggplot')

def save_df_as_image(df, filename, title=None):
    fig, ax = plt.subplots(figsize=(12, len(df)*0.5 + 1)) # Adjust height based on rows
    if len(df) > 20: 
        fig, ax = plt.subplots(figsize=(12, 10)) # Cap size for large tables
    
    ax.xaxis.set_visible(False) 
    ax.yaxis.set_visible(False)
    ax.set_frame_on(False)
    
    if title:
        plt.title(title, fontsize=14, pad=20)
    
    # Create table
    tab = table(ax, df, loc='center', cellLoc='center', rowLoc='center')
    tab.auto_set_font_size(False)
    tab.set_fontsize(10)
    tab.scale(1.2, 1.2) # Scale height
    
    plt.savefig(filename, bbox_inches='tight', dpi=150)
    plt.close()

def main():
    # Load data
    df = pd.read_excel("V.16.1 Rekrutacja.xlsx")
    
    doc = Document()
    doc.add_heading('Rozwiązania Zadań - Rekrutacja', 0)
    
    # Task 1: Sortowanie
    doc.add_heading('I. Sortowanie', level=1)
    doc.add_paragraph('Zadanie: Posortować listę wg EgzHum (Egz. h) od największych do najmniejszych.')
    
    # Sort
    sorted_df = df.sort_values(by='Egz. h', ascending=False)
    
    # Save top 20 rows image
    img_path_1 = "task1_sorted.png"
    save_df_as_image(sorted_df.head(20), img_path_1, title="Posortowane wg Egz. h malejąco (Top 20)")
    
    doc.add_picture(img_path_1, width=Inches(6))
    doc.add_paragraph('Opis: Tabela została posortowana malejąco według kolumny "Egz. h".')
    
    # Task 2: Filtrowanie
    doc.add_heading('II. Filtrowanie', level=1)
    
    # 2a: Only Women
    doc.add_paragraph('Zadanie: Wyświetlić tylko kobiety.')
    # Assuming 'K' is woman.
    women_df = df[df['Płeć'] == 'K']
    img_path_2a = "task2a_women.png"
    save_df_as_image(women_df.head(15), img_path_2a, title="Tylko Kobiety (Top 15)")
    doc.add_picture(img_path_2a, width=Inches(6))
    doc.add_paragraph('Filtrowanie: Płeć = K.')

    # 2b: Women starting with B
    doc.add_paragraph('Zadanie: Wyświetlić kobiety, których nazwisko zaczyna się literą B.')
    women_b_df = women_df[women_df['Nazwisko'].str.startswith('B')]
    img_path_2b = "task2b_women_B.png"
    save_df_as_image(women_b_df, img_path_2b, title="Kobiety na litere B")
    doc.add_picture(img_path_2b, width=Inches(6))
    doc.add_paragraph('Filtrowanie: Płeć = K oraz Nazwisko zaczyna się od "B".')
    
    # 2c: Gimnazjum I or V
    doc.add_paragraph('Zadanie: Uczniowie z I lub V gimnazjum.')
    gim_df = df[df['Gimnazjum'].isin(['I', 'V'])]
    img_path_2c = "task2c_gimnazjum.png"
    save_df_as_image(gim_df.head(15), img_path_2c, title="Gimnazjum I lub V (Top 15)")
    doc.add_picture(img_path_2c, width=Inches(6))
    doc.add_paragraph('Filtrowanie: Gimnazjum równa się "I" lub "V".')
    
    # 2d: Egz. jęz. obcy >= 25
    doc.add_paragraph('Zadanie: Uczniowie z min. 25 pkt z języka obcego.')
    # Assuming Egz. je is the column
    lang_score_df = df[df['Egz. je'] >= 25]
    img_path_2d = "task2d_score.png"
    save_df_as_image(lang_score_df.head(15), img_path_2d, title="Egz. je >= 25 (Top 15)")
    doc.add_picture(img_path_2d, width=Inches(6))
    doc.add_paragraph('Filtrowanie: Egz. je >= 25.')

    # Task 3: Tabele Przestawne
    doc.add_heading('III. Tabele przestawne', level=1)
    
    # 3a: Average EgzHum per Gimnazjum
    doc.add_paragraph('Zadanie: Średnia ilość punktów (Egz. h) dla każdego gimnazjum.')
    pivot1 = df.pivot_table(index='Gimnazjum', values='Egz. h', aggfunc='mean').round(2)
    img_path_3a = "task3a_pivot.png"
    save_df_as_image(pivot1, img_path_3a, title="Średnia Egz. h wg Gimnazjum")
    doc.add_picture(img_path_3a, width=Inches(6))
    doc.add_paragraph('Tabela przestawna: Wiersze=Gimnazjum, Wartości=Średnia z Egz. h.')
    
    # 3b: % of students per Language
    doc.add_paragraph('Zadanie: Procent uczniów uczących się poszczególnych języków.')
    # Create pivot: Count of names per language
    pivot2 = df['Pierwszy język'].value_counts(normalize=True).mul(100).round(2).to_frame(name='% uczniów')
    img_path_3b = "task3b_pivot.png"
    save_df_as_image(pivot2, img_path_3b, title="Procent uczniów wg języka")
    doc.add_picture(img_path_3b, width=Inches(6))
    doc.add_paragraph('Tabela przestawna: Wiersze=Pierwszy język, Wartości=Licznik nazwisk (pokazane jako % sumy końcowej).')
    
    # Save document
    doc_path = "Rozwiązanie_zadań.docx"
    doc.save(doc_path)
    print(f"Document saved to {doc_path}")

if __name__ == "__main__":
    main()
