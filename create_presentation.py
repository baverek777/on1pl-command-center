from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

# Create presentation
prs = Presentation()

# Define colors
BG_COLOR = RGBColor(15, 23, 42)      # #0f172a (Dark Blue)
TEXT_MAIN = RGBColor(248, 250, 252)  # #f8fafc (White)
PRIMARY = RGBColor(255, 215, 0)      # #ffd700 (Gold)
SECONDARY = RGBColor(0, 210, 255)    # #00d2ff (Cyan/Blue)
TEXT_MUTED = RGBColor(148, 163, 184) # #94a3b8 (Grayish)

def set_slide_background(slide):
    background = slide.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = BG_COLOR

def add_title_slide(prs, title_text, subtitle_text):
    slide_layout = prs.slide_layouts[0]
    slide = prs.slides.add_slide(slide_layout)
    set_slide_background(slide)
    
    title = slide.shapes.title
    subtitle = slide.placeholders[1]
    
    title.text = title_text
    title.text_frame.paragraphs[0].font.color.rgb = PRIMARY
    title.text_frame.paragraphs[0].font.size = Pt(54)
    title.text_frame.paragraphs[0].font.bold = True
    
    subtitle.text = subtitle_text
    subtitle.text_frame.paragraphs[0].font.color.rgb = TEXT_MAIN
    subtitle.text_frame.paragraphs[0].font.size = Pt(32)

def add_content_slide(prs, title_text, content_list):
    slide_layout = prs.slide_layouts[1]
    slide = prs.slides.add_slide(slide_layout)
    set_slide_background(slide)
    
    title = slide.shapes.title
    title.text = title_text
    title.text_frame.paragraphs[0].font.color.rgb = PRIMARY
    title.text_frame.paragraphs[0].font.name = "Arial"
    
    body = slide.placeholders[1]
    tf = body.text_frame
    tf.clear()  # Clear default empty paragraph
    
    for item in content_list:
        p = tf.add_paragraph()
        p.text = item
        p.font.color.rgb = TEXT_MAIN
        p.font.size = Pt(28)
        p.space_after = Pt(14)
        p.level = 0

def add_quote_slide(prs, title_text, quote1, source1, quote2, source2):
    slide_layout = prs.slide_layouts[1] # Using content layout as base
    slide = prs.slides.add_slide(slide_layout)
    set_slide_background(slide)
    
    title = slide.shapes.title
    title.text = title_text
    title.text_frame.paragraphs[0].font.color.rgb = PRIMARY
    
    # Custom text boxes for quotes
    left = Inches(1)
    top = Inches(2)
    width = Inches(8.5)
    height = Inches(2)
    
    # Quote 1
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    p = tf.add_paragraph()
    p.text = f'"{quote1}"'
    p.font.italic = True
    p.font.size = Pt(28)
    p.font.color.rgb = TEXT_MAIN
    
    p_source = tf.add_paragraph()
    p_source.text = f"— {source1}"
    p_source.font.size = Pt(20)
    p_source.font.color.rgb = SECONDARY
    p_source.alignment = PP_ALIGN.RIGHT
    
    # Quote 2
    top = Inches(4.5)
    txBox2 = slide.shapes.add_textbox(left, top, width, height)
    tf2 = txBox2.text_frame
    p2 = tf2.add_paragraph()
    p2.text = f'"{quote2}"'
    p2.font.italic = True
    p2.font.size = Pt(28)
    p2.font.color.rgb = TEXT_MAIN
    
    p2_source = tf2.add_paragraph()
    p2_source.text = f"— {source2}"
    p2_source.font.size = Pt(20)
    p2_source.font.color.rgb = SECONDARY
    p2_source.alignment = PP_ALIGN.RIGHT

def add_end_slide(prs):
    slide_layout = prs.slide_layouts[6] # Blank
    slide = prs.slides.add_slide(slide_layout)
    set_slide_background(slide)
    
    left = Inches(1)
    top = Inches(2.5)
    width = Inches(8)
    height = Inches(2)
    
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    
    p = tf.add_paragraph()
    p.text = "Dziękuję za uwagę"
    p.font.size = Pt(54)
    p.font.color.rgb = PRIMARY
    p.alignment = PP_ALIGN.CENTER
    p.font.bold = True
    
    p2 = tf.add_paragraph()
    p2.text = "\"Szczęśliwi czyści sercem.\""
    p2.font.size = Pt(32)
    p2.font.color.rgb = TEXT_MAIN
    p2.alignment = PP_ALIGN.CENTER
    
    p3 = tf.add_paragraph()
    p3.text = "✝"
    p3.font.size = Pt(80)
    p3.font.color.rgb = PRIMARY
    p3.alignment = PP_ALIGN.CENTER

# 1. Slide
add_title_slide(prs, "Błogosławieni\nczystego serca", "...albowiem oni Boga oglądać będą.\n(Mt 5, 8)")

# 2. Slide
add_content_slide(prs, "O kogo chodzi?", [
    "• Wyrażenie „czyste serce” dotyczy całego wnętrza człowieka: intelektu, woli i decyzji.",
    "• Ludzie o nierozdwojonym sercu, szczerzy i autentyczni.",
    "• Ci, którzy szukają woli Bożej bez obłudy.",
    "• Osoby wolne od pychy i przywiązania do grzechu."
])

# 3. Slide
add_content_slide(prs, "Treść Błogosławieństwa", [
    "Obietnica „oglądania Boga” ma wymiar podwójny:",
    "• Mowa o dostrzeganiu Boga w codzienności i drugim człowieku (Teraz).",
    "• Ostateczne spotkanie „twarzą w twarz” w Niebie - Visio Beatifica (W wieczności).",
    "• Warunek: Czystość intencji i robienie wszystkiego na chwałę Bożą."
])

# 4. Slide (Quotes)
add_quote_slide(prs, "Ważne Cytaty", 
                "Stwórz, o Boże, we mnie serce czyste i odnów we mnie ducha prawego.", "Psalm 51, 12",
                "Celem zaś tego nakazu jest miłość płynąca z czystego serca, z dobrego sumienia i z wiary nieobłudnej.", "1 Tm 1, 5")

# 5. Slide
add_content_slide(prs, "Jak dbać o czystość serca?", [
    "• Sakramenty: Regularna spowiedź i Eucharystia.",
    "• Modlitwa: Codzienny dialog z Bogiem.",
    "• Słowo Boże: Czytanie Pisma Świętego.",
    "• Czynienie dobra: Unikanie grzechu i pomoc bliźnim."
])

# 6. Slide
add_content_slide(prs, "Podsumowanie", [
    "• Błogosławieństwo czystego serca to zaproszenie do transparentności przed Bogiem.",
    "• To droga życia w prawdzie, bez masek i pozorów.",
    "• Nagrodą jest bliskość Boga w codziennym życiu i wizja Jego oblicza po śmierci."
])

# 7. Slide
add_end_slide(prs)

# Save
prs.save('c:\\Antygravity\\prezentacja_religia.pptx')
print("Presentation saved successfully.")
