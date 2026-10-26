import win32com.client
import time

file_path = r"c:\Antygravity\Meta_SQB_Blocks_Refined.xlsx"

try:
    print("Otwieranie Excela...")
    excel = win32com.client.Dispatch("Excel.Application")
    excel.Visible = True
    workbook = excel.Workbooks.Open(file_path)
    worksheet = workbook.ActiveSheet
    worksheet.UsedRange.Copy()
    print("Skopiowano do schowka! Możesz teraz wkleić zawartość (Ctrl+V) w Arkuszach Google.")
    # Nie zamykamy excela, żeby schowek nie zniknął
except Exception as e:
    print(f"Błąd: {e}")
