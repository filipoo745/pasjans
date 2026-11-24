# Pasjans (Klondike)

Otwórz `index.html` w przeglądarce (dwuklik) — nic nie trzeba instalować.

## Sterowanie
- **Kliknięcie karty** – automatyczny ruch (najpierw na stos A, potem na kolumnę)
- **Przeciąganie** – dowolny poprawny ruch (działa też dotykiem)
- **Spacja** – dobierz · **H** – podpowiedź · **Ctrl/⌘+Z** – cofnij
- Gdy wszystko jest odkryte, pojawia się przycisk **Dokończ automatycznie**

Gra zapisuje się sama (możesz zamknąć kartę i wrócić).

## Wygląd
**W grze:** przycisk **⚙ Wygląd** → wybór motywu (Klasyczny, Ciemny clean, Neon, Papier)
i sekcja **Dostosuj**: kolory stołu, kart, kolorów, rewersu, wzór rewersu, czcionka,
zaokrąglenie rogów, talia 4-kolorowa.

**Na stałe w kodzie:** wszystkie motywy są w `js/themes.js`.
1. Ustaw wygląd w grze → **Eksportuj motyw** (kopiuje kod do schowka)
2. Wklej go do listy `themes` w `js/themes.js`, zmień `id` i `name`
3. Odśwież stronę

Tam też dodasz nowe wzory rewersu (`patterns`) i czcionki (`fonts`).

## Pliki
- `index.html` – struktura strony
- `css/style.css` – układ i wygląd kart (korzysta ze zmiennych motywu)
- `js/themes.js` – motywy, wzory rewersów, czcionki ← tu się bawisz grafiką
- `js/game.js` – zasady i logika gry
