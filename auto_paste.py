import pygetwindow as gw
import pyautogui
import pyperclip
import time
import sys

with open('c:\\Antygravity\\sqb_meta_wszystkie_br.tsv', 'r', encoding='utf-8') as f:
    data = f.read()

pyperclip.copy(data)

windows = gw.getAllWindows()
sheets_win = None
for w in windows:
    if 'Arkusze Google' in w.title or 'Google Sheets' in w.title or 'CZYSTA META' in w.title.upper() or 'SQB' in w.title.upper():
        sheets_win = w
        break

if not sheets_win:
    print("Nie znaleziono okna z Arkuszami Google.")
    sys.exit(1)

try:
    if sheets_win.isMinimized:
        sheets_win.restore()
    sheets_win.activate()
except Exception as e:
    print(f"Błąd aktywacji okna: {e}")
    # Fallback to pressing ALT+TAB if it was the last active window
    pass

time.sleep(1.5)

# Przejście do A1
pyautogui.hotkey('ctrl', 'home')
time.sleep(0.5)

# Wklejenie
pyautogui.hotkey('ctrl', 'v')
time.sleep(2)

# Formatowanie nagłówka (zaznacz wiersz i pogrub)
pyautogui.hotkey('ctrl', 'home')
time.sleep(0.5)
pyautogui.hotkey('shift', 'space')
time.sleep(0.5)
pyautogui.hotkey('ctrl', 'b')

print("Wklejono!")
