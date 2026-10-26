# 📡 ANALIZA TECHNICZNA: SYSTEM "S.E.T.I." (Based on Wiki Data)

## 📊 Parametry Operacyjne
Na podstawie dostarczonej dokumentacji (Wiki Screenshots):

### 1. SATELLITE DISH CONTROLLER (Tier III)
*   **Koszt Energii:** 75 kMF/s (0.075 MMF/s).
*   **Zużycie Płynu:** **0.5 L/s** (To jest kluczowe!).
*   **Efekt:** Boostuje RP (Research Points) wszystkich stacji badawczych.
*   **Mechanika:** Im silniejszy płyn (RP Value), tym trudniej utrzymać 100% wydajności (potrzeba więcej anten).

### 2. SATELLITE DISH (Antena)
*   **Koszt Energii:** 75 kMF/s.
*   **Funkcja:** Zwiększa "Efficiency" (Wydajność) systemu.
*   **Zasada:** "Efficiency per Dish is DECREASED when using fluids with higher RP values".
    *   Wniosek: Dla Kwasu Solnego (RP Value 10) jedna antena daje mniej % niż dla wody. Może być potrzebne więcej niż 5 anten na kontroler!

### 🧪 PALIWO: KWAS SOLNY (HYDROCHLORIC ACID)
*   **RP Value:** 10 (Bardzo wysokie).
*   **Boost:** 81.23% (dla jednego kontrolera).
*   **Wymagany przepływ:**
    *   Planujemy 15 Kontrolerów.
    *   15 * 0.5 L/s = **7.5 L/s**.
    *   Musisz zapewnić solidną produkcję kwasu (szereg Chemical Plants), aby utrzymać to ciśnienie.

## ⚠️ ZAGROŻENIA
1.  **Niedobór płynu:** Jeśli spadnie poniżej 7.5 L/s, boost przestanie działać stabilnie.
2.  **Zbyt mało anten:** Przy RP=10, standardowe 5 anten może dać np. 90% wydajności.
    *   **Rozwiązanie:** Obserwuj "Research Tracking Panel". Jeśli będzie czerwony komunikat, musimy dobudować anteny (np. 6-7 na kontroler).

---
*Dane zaktualizowane na podstawie dokumentacji Miraheze.*
