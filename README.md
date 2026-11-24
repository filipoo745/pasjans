# Pasjans (Klondike)

Cała gra to **jeden plik: `index.html`**. Otwórz go w przeglądarce (dwuklik) — nic nie trzeba instalować.

## Wrzucenie na GitHub Pages
1. Utwórz repozytorium na GitHubie i wrzuć do niego `index.html` (Add file → Upload files).
2. Settings → Pages → Source: **Deploy from a branch**, branch **main**, folder **/ (root)** → Save.
3. Po chwili gra będzie pod adresem `https://<twoj-login>.github.io/<nazwa-repo>/`.

## Sterowanie
- **Kliknięcie karty** – automatyczny ruch (najpierw na stos A, potem na kolumnę)
- **Przeciąganie** – dowolny poprawny ruch (działa też dotykiem)
- **Spacja** – dobierz · **H** – podpowiedź · **Ctrl/⌘+Z** – cofnij
- Gdy wszystko jest odkryte, pojawia się przycisk **Dokończ automatycznie**

Gra zapisuje się sama (możesz zamknąć kartę i wrócić).

## Wygląd
**W grze:** przycisk **⚙ Wygląd** → motyw (Klasyczny, Ciemny clean, Neon, Papier)
i sekcja **Dostosuj**: kolory, wzór rewersu, czcionka, zaokrąglenie rogów, talia 4-kolorowa.

**Na stałe w kodzie:** w `index.html` znajdź sekcję `MOTYWY PASJANSA`.
1. Ustaw wygląd w grze → **Eksportuj motyw** (kopiuje kod do schowka)
2. Wklej go do listy `themes`, zmień `id` i `name`
3. Odśwież stronę

Tam też dodasz nowe wzory rewersu (`patterns`) i czcionki (`fonts`).
