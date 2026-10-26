import docx

def read_docx(file_path):
    try:
        doc = docx.Document(file_path)
        full_text = []
        for paragraph in doc.paragraphs:
            if paragraph.text.strip():
                full_text.append(paragraph.text)
        return '\n'.join(full_text)
    except Exception as e:
        return f"Error reading file: {e}"

if __name__ == "__main__":
    file_path = "c:/Antygravity/Zadania_Rozwiazane_Final.docx"
    print(read_docx(file_path))
