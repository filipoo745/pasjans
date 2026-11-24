/* =====================================================================
   MOTYWY PASJANSA
   ---------------------------------------------------------------------
   Tu definiujesz wygląd gry. Każdy motyw to zestaw zmiennych CSS.

   Jak dodać własny motyw:
   1. Skopiuj cały obiekt jednego z motywów (od { do },).
   2. Zmień "id" (bez spacji) i "name" (to, co widać w menu).
   3. Pozmieniaj kolory. Kolory oznaczone (HEX) muszą być w formacie #rrggbb,
      bo da się je potem edytować w panelu "Dostosuj".
   4. Odśwież stronę — motyw pojawi się w Ustawieniach.

   Najszybciej: ustaw wszystko w grze (⚙ → Dostosuj), kliknij
   "Eksportuj motyw" i wklej skopiowany kod do listy poniżej.
   ===================================================================== */

window.SolitaireThemes = {
  themes: [
    {
      id: 'classic',
      name: 'Klasyczny',
      backPattern: 'lattice',
      vars: {
        '--bg-1': '#2f8f46',          // stół – środek (HEX)
        '--bg-2': '#124d25',          // stół – brzegi (HEX)
        '--bg-image': 'radial-gradient(rgba(255,255,255,.035) 1px, transparent 1.2px)',
        '--bg-size': '4px 4px',
        '--ui-text': '#f3f7ef',
        '--ui-panel': 'rgba(0,0,0,.22)',
        '--ui-border': 'rgba(255,255,255,.18)',
        '--accent': '#f4c542',        // (HEX)
        '--accent-text': '#1b1b1b',
        '--card-face': '#fffef9',     // (HEX)
        '--card-border': '#c9c4b5',   // (HEX)
        '--card-shadow': '0 1px 2px rgba(0,0,0,.35)',
        '--card-glow': 'none',
        '--card-radius': '0.35em',
        '--red': '#c8102e',           // kier i karo (HEX)
        '--black': '#1b1b1b',         // pik i trefl (HEX)
        '--blue': '#1d5fbf',          // karo w talii 4-kolorowej (HEX)
        '--green': '#1e8a3c',         // trefl w talii 4-kolorowej (HEX)
        '--face-frame': '#f6eed8',
        '--back-1': '#1f4aa8',        // rewers – tło (HEX)
        '--back-2': '#6f95e6',        // rewers – wzór (HEX)
        '--back-border': '#ffffff',   // rewers – ramka (HEX)
        '--slot': 'rgba(255,255,255,.25)',
        '--font-card': "Georgia, 'Times New Roman', serif",
        '--font-ui': "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      },
    },
    {
      id: 'dark',
      name: 'Ciemny clean',
      backPattern: 'stripes',
      vars: {
        '--bg-1': '#1b1e25',
        '--bg-2': '#0c0e12',
        '--bg-image': 'none',
        '--bg-size': 'auto',
        '--ui-text': '#e8eaf0',
        '--ui-panel': 'rgba(255,255,255,.05)',
        '--ui-border': 'rgba(255,255,255,.1)',
        '--accent': '#7c9cff',
        '--accent-text': '#0c0e12',
        '--card-face': '#1f232c',
        '--card-border': '#343a48',
        '--card-shadow': '0 2px 8px rgba(0,0,0,.45)',
        '--card-glow': 'none',
        '--card-radius': '0.5em',
        '--red': '#ff6b7a',
        '--black': '#e9ecf2',
        '--blue': '#6ab0ff',
        '--green': '#5fd39a',
        '--face-frame': '#262b36',
        '--back-1': '#252a35',
        '--back-2': '#2f3544',
        '--back-border': '#7c9cff',
        '--slot': 'rgba(255,255,255,.09)',
        '--font-card': "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        '--font-ui': "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      },
    },
    {
      id: 'neon',
      name: 'Neon',
      backPattern: 'grid',
      vars: {
        '--bg-1': '#1d0640',
        '--bg-2': '#05010d',
        '--bg-image': 'linear-gradient(rgba(255,43,214,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(60,242,255,.06) 1px, transparent 1px)',
        '--bg-size': '44px 44px',
        '--ui-text': '#f5e9ff',
        '--ui-panel': 'rgba(255,43,214,.08)',
        '--ui-border': 'rgba(60,242,255,.35)',
        '--accent': '#ff2bd6',
        '--accent-text': '#14001f',
        '--card-face': '#140a26',
        '--card-border': '#b02bff',
        '--card-shadow': '0 0 10px rgba(255,43,214,.35)',
        '--card-glow': '0 0 .35em currentColor',
        '--card-radius': '0.6em',
        '--red': '#ff3fa4',
        '--black': '#3cf2ff',
        '--blue': '#b388ff',
        '--green': '#7dff9b',
        '--face-frame': '#1f0f3a',
        '--back-1': '#22083f',
        '--back-2': '#7a1fa8',
        '--back-border': '#3cf2ff',
        '--slot': 'rgba(60,242,255,.28)',
        '--font-card': "'Trebuchet MS', 'Avenir Next', sans-serif",
        '--font-ui': "'Trebuchet MS', 'Avenir Next', system-ui, sans-serif",
      },
    },
    {
      id: 'paper',
      name: 'Papier',
      backPattern: 'dots',
      vars: {
        '--bg-1': '#f6f1e8',
        '--bg-2': '#ddd3c0',
        '--bg-image': 'none',
        '--bg-size': 'auto',
        '--ui-text': '#3b3a36',
        '--ui-panel': 'rgba(255,255,255,.55)',
        '--ui-border': 'rgba(0,0,0,.12)',
        '--accent': '#d1495b',
        '--accent-text': '#ffffff',
        '--card-face': '#fffdf8',
        '--card-border': '#d8cfbf',
        '--card-shadow': '0 1px 3px rgba(60,40,10,.2)',
        '--card-glow': 'none',
        '--card-radius': '0.45em',
        '--red': '#d1495b',
        '--black': '#2d3142',
        '--blue': '#2e86ab',
        '--green': '#3c8d5a',
        '--face-frame': '#f6efe2',
        '--back-1': '#edae49',
        '--back-2': '#fff3d6',
        '--back-border': '#fffdf8',
        '--slot': 'rgba(0,0,0,.14)',
        '--font-card': "'Avenir Next', 'Helvetica Neue', Arial, sans-serif",
        '--font-ui': "'Avenir Next', 'Helvetica Neue', Arial, sans-serif",
      },
    },
  ],

  /* Wzory rewersu. c1 = "Rewers – tło", c2 = "Rewers – wzór".
     Zwracają background-image i background-size (jednostka em skaluje się z kartą). */
  patterns: {
    lattice: { name: 'Romby (klasyczny)', css: (c1, c2) => ({
      image: `repeating-linear-gradient(45deg, ${c2} 0 .06em, transparent .06em .42em), repeating-linear-gradient(-45deg, ${c2} 0 .06em, transparent .06em .42em)`,
      size: 'auto' }) },
    stripes: { name: 'Paski', css: (c1, c2) => ({
      image: `repeating-linear-gradient(135deg, ${c2} 0 .14em, transparent .14em .4em)`,
      size: 'auto' }) },
    dots: { name: 'Kropki', css: (c1, c2) => ({
      image: `radial-gradient(circle, ${c2} 0 .09em, transparent .1em)`,
      size: '.45em .45em' }) },
    grid: { name: 'Kratka', css: (c1, c2) => ({
      image: `linear-gradient(${c2} .05em, transparent .05em), linear-gradient(90deg, ${c2} .05em, transparent .05em)`,
      size: '.5em .5em' }) },
    checker: { name: 'Szachownica', css: (c1, c2) => ({
      image: `conic-gradient(${c2} 25%, transparent 0 50%, ${c2} 0 75%, transparent 0)`,
      size: '.6em .6em' }) },
    gradient: { name: 'Gradient', css: (c1, c2) => ({
      image: `linear-gradient(135deg, ${c1}, ${c2})`,
      size: 'auto' }) },
    solid: { name: 'Gładki', css: () => ({ image: 'none', size: 'auto' }) },
  },

  /* Czcionki kart do wyboru w panelu. */
  fonts: [
    { name: 'Klasyczna (szeryfowa)', value: "Georgia, 'Times New Roman', serif" },
    { name: 'Elegancka', value: "'Palatino Linotype', Palatino, 'Book Antiqua', serif" },
    { name: 'Nowoczesna', value: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" },
    { name: 'Zaokrąglona', value: "'Trebuchet MS', 'Avenir Next', sans-serif" },
    { name: 'Geometryczna', value: "'Avenir Next', 'Helvetica Neue', Arial, sans-serif" },
    { name: 'Maszynowa', value: "'Courier New', ui-monospace, monospace" },
  ],
};
