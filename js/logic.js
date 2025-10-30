/* === Fuentes IDarte === */
@font-face {
  font-family: 'HK Grotesk';
  src: url('../fonts/HKGrotesk-Regular.woff2') format('woff2'),
       url('../fonts/HKGrotesk-Regular.woff') format('woff');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'HK Grotesk';
  src: url('../fonts/HKGrotesk-Medium.woff2') format('woff2'),
       url('../fonts/HKGrotesk-Medium.woff') format('woff');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'HK Grotesk';
  src: url('../fonts/HKGrotesk-Bold.woff2') format('woff2'),
       url('../fonts/HKGrotesk-Bold.woff') format('woff');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

:root {
  --id-primary: #530CED;
  --id-illustration: #CE6B78;
  --id-animation: #23D9B7;
  --id-yellow: #E2F208;
  --id-erasmus: #97DFFC;
  --bg: #fafafa;
  --muted: #6b7280;
  --card-bg: #ffffff;
  --max-width: 1100px;
}

* { box-sizing: border-box; }

body {
  font-family: 'HK Grotesk', 'Fira Sans', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
  background: var(--bg);
  margin: 0;
  color: #111827;
  padding: 24px;
}

.wrap {
  max-width: var(--max-width);
  margin: auto;
}

/* === CABECERA === */
header.brand {
  display: flex;
  gap: 18px;
  align-items: center;
  background: var(--card-bg);
  padding: 18px;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(16,24,40,0.06);
  border-left: 6px solid var(--id-primary);
}

.logo {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo img {
  max-width: 100%;
  max-height: 100%;
}

.brand h1 {
  margin: 0;
  font-size: 24px;
  color: var(--id-primary);
  font-weight: 800;
}

.brand p {
  margin: 6px 0 0 0;
  color: var(--muted);
  font-size: 14px;
}

.controls {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-left: auto;
}

.select, .btn {
  background: rgba(255,255,255,0.7);
  border: 1px solid rgba(15,23,42,0.06);
  padding: 8px 12px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
}

.btn.primary {
  background: linear-gradient(90deg, var(--id-primary), #7b4bff);
  color: white;
  border: none;
  box-shadow: 0 6px 18px rgba(83,12,237,0.14);
  margin-right: 16px;
}

/* === CUERPO PRINCIPAL === */
main.stage {
  margin-top: 18px;
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 18px;
  align-items: start;
}

.stage-left {
  background: var(--card-bg);
  padding: 20px;
  border-radius: 12px;
  min-height: 420px;
  box-shadow: 0 6px 20px rgba(16,24,40,0.04);
  position: relative;
}

.stage-left::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: linear-gradient(transparent 0 calc(100% - 0px), rgba(14,20,30,0.02) 0),
                    linear-gradient(90deg, transparent 0 calc(100% - 0px), rgba(14,20,30,0.02) 0);
  background-size: 80px 80px, 80px 80px;
  opacity: 0.7;
  pointer-events: none;
}

/* === PESTAÑAS === */
.tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.tab {
  padding: 10px 12px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 13px;
  background: linear-gradient(180deg, rgba(16,24,40,0.03), rgba(16,24,40,0.01));
  cursor: pointer;
  border: 1px solid rgba(15,23,42,0.04);
  transition: all 0.2s ease;
  flex: 1 1 auto;
  min-width: 120px;
  text-align: center;
  white-space: nowrap;
}

.tab.active {
  background: white;
  border-left: 4px solid var(--id-primary);
  box-shadow: 0 10px 30px rgba(83,12,237,0.06);
}

/* === PANELES === */
.panel {
  background: linear-gradient(180deg, white, #fbfbff);
  border-radius: 10px;
  padding: 18px;
  border: 1px solid rgba(15,23,42,0.03);
  margin-bottom: 14px;
  animation: fadeIn 0.3s ease;
}

/* === BARRA LATERAL === */
aside.sidebar {
  position: sticky;
  top: 28px;
  height: fit-content;
  align-self: start;
  background: linear-gradient(180deg, var(--card-bg), #fff);
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(16,24,40,0.04);
  border-left: 6px solid var(--id-animation);
}

.card {
  background: linear-gradient(180deg, rgba(255,255,255,0.9), #fff);
  padding: 14px;
  border-radius: 10px;
  margin-bottom: 12px;
  border: 1px solid rgba(15,23,42,0.04);
}

.card h4 {
  margin: 0 0 8px 0;
  color: var(--muted);
  font-size: 12px;
}

.card p.value {
  font-size: 20px;
  margin: 0;
  font-weight: 800;
  color: var(--id-primary);
}

/* === FOOTER === */
footer.siteinfo {
  margin-top: 18px;
  text-align: center;
  color: var(--muted);
  font-size: 13px;
}

/* === RESPONSIVE === */
@media (max-width: 1000px) {
  main.stage {
    grid-template-columns: 1fr;
  }
  
  aside.sidebar {
    position: relative;
    border-left: 6px solid var(--id-primary);
  }
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-grid label {
    text-align: left;
    padding-right: 0;
  }
  
  header.brand {
    flex-direction: column;
    text-align: center;
  }
  
  .controls {
    margin-left: 0;
    justify-content: center;
  }
}

/* === CLASES UTILITARIAS === */
.muted { color: var(--muted); }

.pill {
  display: inline-block;
  padding: 6px 8px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 12px;
}

.color-swatch {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.06);
}

.grid-small {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.hero-visual {
  width: 100%;
  height: 160px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: white;
  font-weight: 800;
}

table.min-w {
  width: 100%;
  border-collapse: collapse;
}

table.min-w td, table.min-w th {
  padding: 8px;
  border-top: 1px solid #f1f5f9;
}

input[type="number"], input[type="text"], select {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e6edf3;
  font-family: inherit;
}

/* === LOGO IDARTE === */
.idarte-logo {
  filter: brightness(0) saturate(100%) invert(21%) sepia(95%) saturate(6800%) hue-rotate(253deg) brightness(94%) contrast(107%);
}

/* === GRIDS ESPECIALES === */
.idarte-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 12px;
  align-items: center;
}

.idarte-grid img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  object-fit: contain;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 16px;
  align-items: center;
  margin-top: 12px;
  max-width: 600px;
}

.form-grid label {
  font-weight: 500;
  text-align: right;
  padding-right: 8px;
}

.form-grid input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

/* === ANIMACIONES === */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* === SCROLLBAR PARA TABS === */
.tabs {
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
}

.tabs::-webkit-scrollbar {
  height: 6px;
}

.tabs::-webkit-scrollbar-track {
  background: transparent;
}

.tabs::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

/* === BOTONES PEQUEÑOS === */
.btn.small {
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 6px;
}

/* === IMÁGENES === */
img {
  overflow: visible !important;
  max-width: 100%;
  height: auto;
}
