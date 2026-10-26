# 🧠 BAZA WIEDZY: ROBLOX INDUSTRIALIST
*Zbiór wszystkich zgromadzonych przeze mnie informacji na temat mechanik, maszyn i systemów w grze.*

## ⚡ SYSTEM ENERGETYCZNY (POWER)
Jednostka energii: **MMF** (MamyFlux). 1 MMF/s ≈ 1 Watt.

### 1. Maszyny Parowe (Steam Power)
Podstawa energetyki. Wymaga układu: **Źródło Ciepła -> Kocioł -> Turbina**.

*   **Boiler (Kocioł):**
    *   Zamienia wodę w parę.
    *   Wymaga źródła ciepła (Heat Source) i wody.
    *   **Źródła ciepła:**
        *   *Firebox:* Węgiel + Woda. Tani, Tier 1.
        *   *Industrial Firebox:* Paliwa płynne/stałe. Max temp 300°C.
        *   *Gas Burner:* Spalanie gazu. Bardzo wydajny (zasila 10 kotłów), daje temp. do 400°C. Potężny zrzut wody.
        *   *Electric Heater:* Używa prądu (do 320°C).
        *   *Geothermal Well:* Darmowe ciepło, ale niska temperatura (10-20°C różnicy) i straty wody (33%).
*   **Steam Turbine (Mała Turbina):**
    *   Tier 1. Produkcja: ~1.95 kMF/s.
    *   Zużywa 0.3L pary/s.
    *   Niewrażliwa na temperaturę pary (działa tak samo przy każdej).
*   **Large Turbine (Duża Turbina):**
    *   Tier 2. Kluczowa dla dużych elektrowni (CCP).
    *   **Mechanika RPM:** Musi się "rozkręcić" (Spin-up). Pełna moc przy 3600-4000 RPM.
    *   **Zużycie:** 90L pary/s (3 jednostki na tick).
    *   **Wyjście:** Produkuje wodę (kondensat) o temp. max 99°C (1/3 temp. wejściowej).
    *   **WAŻNE (Water Lock):** Jeśli woda wyjściowa nie ma gdzie uciec (zatkana rura), turbina przestaje działać! Wymaga pomp lub Liquid Dump.

### 2. Silniki Spalinowe (Combustion Engines)
*   **Gasoline Generator:** Mały, słaby (12 kMF/s). Głównie do spalania nadmiaru benzyny.
*   **Diesel Generator:** Tier 2. Produkcja ~90 kMF/s.
*   **Modular Diesel Engine (MDE):**
    *   Potężny system modułowy (~1.5 MMF/s na mały silnik).
    *   Wymaga złożenia z części: *Controller, Crankshaft, Cylinder, Generator, Flywheel, Fuel/Air Input, Exhaust*.
    *   Paliwo: Najlepiej Refined Diesel.
    *   Bardzo skalowalny (można łączyć wiele cylindrów).

## 🛢️ PŁYNY I SUROWCE
*   **Woda:** Kluczowa jako chłodziwo i medium robocze (para).
*   **Etanol:** Twój obecny produkt (z 36 Rafinerii Plastiku). Może być używany jako paliwo w niektórych paleniskach.
*   **Ropa (Crude Oil):** Baza do Diesla, Plastiku, Gazu.
*   **Diesel:** Wersje: Crude, Poor Quality, Refined. Paliwo do MDE.
*   **Purple Gold (Fioletowe Złoto):** Produkt końcowy (Late Game).
    *   Wymaga: Kwasu Octowego (Acetic Acid), Table Salt, Sulfur Dioxide, Sodium Carbonate.

## 🛠️ MECHANIKI BUDOWLANE
*   **Rurociągi:** Mają limit przepustowości.
    *   *Problem:* Podłączenie 60 pomp do jednej rury powoduje zator.
    *   *Rozwiązanie:* Podział na niezależne magistrale (np. 1 rura na 5 maszyn).
*   **System Elektryczny:**
    *   Wymaga transformatorów (HV, MV, LV) i słupów (Pylons) do przesyłu.
    *   Baterie (Battery) są kluczowe jako bufor stabilizujący sieć.

## ⚠️ NAJCZĘSTSZE PROBLEMY (TROUBLESHOOTING)
1.  **Turbina nie działa (0 RPM):**
    *   Brak pary? (Sprawdź wodę w kotłach).
    *   Zator wodny na wyjściu? (Sprawdź rurę "Water Output" – musi być pusta).
2.  **Brak paliwa:**
    *   Za małe ciśnienie w rurach paliwowych.
3.  **Zbyt niska temperatura pary:**
    *   Słabe źródło ciepła (np. zwykły Firebox do Large Turbine to za mało na pełną moc).

---
*Dokument w ciągłej rozbudowie w miarę postępów prac.*
