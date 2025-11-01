/* =========================================
// IDarte · Enpresa Gastuen Aurrekontua
// Lógica completa: datos, pestañas, cálculos,
// idioma, resumen y exportación a PDF
// =========================================

/* ============
   GLOBAL STATE
   ============ */
const state = {
  amortizables: { lokala: [], garraioa: [] },
  recurrings: { lokala: [], ekoizpena: [], garraioa: [], hazkuntza: [] },
  personnel: [],
  partners: [0,0,0],
  finance: { loanAmount:0, loanTAE:5, loanTerm:5, annualInterest:0, totalFinancialCost:0 }
};

/* ==============================
   TRADUCCIONES FALLBACK (lang.json)
   ============================== */
let translations = {};
const fallbackTranslations = {
  eu: {
    "header.title":"IDarte · Euskadiko Diseinu Eskola Publikoa",
    "header.subtitle":"BARNE DISEINU GRADUA - Neurketak eta Aurrekontuak",
    "button.download":"Deskargatu",
    "tab.lokal":"1 · Lokal",
    "tab.pertsonala":"2 · Pertsonala",
    "tab.ekoizpena":"3 · Ekoizpena",
    "tab.garraioa":"4 · Garraioa",
    "tab.hazkuntza":"5 · Hazkuntza",
    "tab.finantzaketa":"6 · Finantzaketa",
    "tab.prezioa":"7 · Prezioa",
    "summary.title":"Laburpen Orokorra",
    "summary.subtitle":"Aurrekontu globala",
    "footer.note":"IDarte · Euskadiko Diseinu Eskola Publikoa — Escuela Pública de Diseño de Euskadi.",
    "loading":"Txostena prestatzen..."
  },
  es: {
    "header.title":"IDarte · Escuela Pública de Diseño de Euskadi",
    "header.subtitle":"GRADO EN DISEÑO DE INTERIORES - Mediciones y Presupuestos",
    "button.download":"Descargar",
    "tab.lokal":"1 · Local",
    "tab.pertsonala":"2 · Personal",
    "tab.ekoizpena":"3 · Producción",
    "tab.garraioa":"4 · Transporte",
    "tab.hazkuntza":"5 · Crecimiento",
    "tab.finantzaketa":"6 · Financiación",
    "tab.prezioa":"7 · Precio/Hora",
    "summary.title":"Resumen General",
    "summary.subtitle":"Presupuesto global",
    "footer.note":"IDarte · Escuela Pública de Diseño de Euskadi — Euskadiko Diseinu Eskola Publikoa.",
    "loading":"Preparando el informe..."
  }
};

/* =====================
   UTILIDADES BÁSICAS
   ===================== */
function uid(prefix='id'){ return prefix + '-' + Math.random().toString(36).slice(2,9); }
function fmt(n){ n=Number(n)||0; try{ return new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(n);}catch(e){return '€'+n.toFixed(2);} }
function safeNum(v){ return Number(v||0)||0; }
function qs(sel){ return document.querySelector(sel); }
function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }

/* ===========================
   CARGA TRADUCCIONES
   =========================== */
async function loadTranslations(lang){
  try{
    const res = await fetch('lang/lang.json');
    if(!res.ok) throw new Error('no file');
    const all = await res.json();
    translations = all;
  }catch(e){
    translations = fallbackTranslations;
  }
  applyTranslations(lang || localStorage.getItem('selectedLanguage') || 'eu');
}

function applyTranslations(lang){
  if(!translations[lang]) translations = fallbackTranslations;
  const strings = translations[lang];
  qsa('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    if(strings[key]) el.textContent = strings[key];
  });
  const dl = document.getElementById('download-report-btn');
  if(dl) dl.textContent = strings['button.download'];
  localStorage.setItem('selectedLanguage', lang);
  document.documentElement.lang = lang;
}

/* ===========================
   CONSTRUCCIÓN DE PANELES
   =========================== */
function buildPanelsIfEmpty(){
  // Ya definidos en tu HTML, por tanto no se reconstruyen.
  // (Función conservada por compatibilidad)
}

/* ===========================
   CRUD Y RENDER DE TABLAS
   =========================== */
function renderAllTables(){
  const renderAmort = (cat, tbodyId)=>{
    const tb = document.getElementById(tbodyId);
    if(!tb) return;
    tb.innerHTML='';
    state.amortizables[cat].forEach(it=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`
        <td><input value="${it.name}" data-id="${it.id}" data-field="name" onchange="onFieldChange(event)" /></td>
        <td style="text-align:right"><input type="number" value="${it.cost}" data-id="${it.id}" data-field="cost" onchange="onFieldChange(event)" /></td>
        <td style="text-align:center"><input type="number" value="${it.life}" data-id="${it.id}" data-field="life" onchange="onFieldChange(event)" /></td>
        <td style="text-align:right">${fmt(it.cost/it.life)}</td>
        <td><button onclick="removeAmortizable('${it.id}','${cat}')" class="btn small">✕</button></td>`;
      tb.appendChild(tr);
    });
  };
  renderAmort('lokala','lokala-amortizable-body');
  renderAmort('garraioa','garraioa-amortizable-body');

  const renderRec = (cat, tbodyId)=>{
    const tb=document.getElementById(tbodyId);
    if(!tb) return;
    tb.innerHTML='';
    state.recurrings[cat].forEach(it=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`
        <td><input value="${it.name}" data-id="${it.id}" data-field="name" onchange="onFieldChange(event)" /></td>
        <td style="text-align:right"><input type="number" value="${it.payment_cost}" data-id="${it.id}" data-field="payment_cost" onchange="onFieldChange(event)" /></td>
        <td style="text-align:center"><input type="number" value="${it.frequency}" data-id="${it.id}" data-field="frequency" onchange="onFieldChange(event)" /></td>
        <td style="text-align:right">${fmt(it.payment_cost*it.frequency)}</td>
        <td><button onclick="removeRecurring('${it.id}','${cat}')" class="btn small">✕</button></td>`;
      tb.appendChild(tr);
    });
  };
  renderRec('lokala','lokala-recurring-body');
  renderRec('ekoizpena','ekoizpena-recurring-body');
  renderRec('garraioa','garraioa-recurring-body');
  renderRec('hazkuntza','hazkuntza-recurring-body');

  const tbP=document.getElementById('personnel-body');
  if(tbP){ tbP.innerHTML='';
    state.personnel.forEach(p=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`
        <td><input value="${p.role}" data-id="${p.id}" data-field="role" onchange="onFieldChange(event)" /></td>
        <td style="text-align:right"><input type="number" value="${p.gross}" data-id="${p.id}" data-field="gross" onchange="onFieldChange(event)" /></td>
        <td style="text-align:center"><input type="number" value="${p.employer_ss}" data-id="${p.id}" data-field="employer_ss" onchange="onFieldChange(event)" /></td>
        <td style="text-align:right">${fmt(p.gross*(1+p.employer_ss/100))}</td>
        <td><button onclick="removePersonnel('${p.id}')" class="btn small">✕</button></td>`;
      tbP.appendChild(tr);
    });
  }
}

/* ===========================
   CRUD FUNCTIONS
   =========================== */
window.addAmortizable=function(cat){state.amortizables[cat].push({id:uid('am'),name:'Ekipamendua',cost:1000,life:5,category:cat});renderAllTables();updateAll();};
window.removeAmortizable=function(id,cat){state.amortizables[cat]=state.amortizables[cat].filter(x=>x.id!==id);renderAllTables();updateAll();};
window.addRecurring=function(cat){state.recurrings[cat].push({id:uid('r'),name:'Gastu',payment_cost:100,frequency:12,category:cat});renderAllTables();updateAll();};
window.removeRecurring=function(id,cat){state.recurrings[cat]=state.recurrings[cat].filter(x=>x.id!==id);renderAllTables();updateAll();};
window.addPerson=function(){state.personnel.push({id:uid('p'),role:'Diseinatzaile',gross:25000,employer_ss:30});renderAllTables();updateAll();};
window.removePersonnel=function(id){state.personnel=state.personnel.filter(p=>p.id!==id);renderAllTables();updateAll();};

window.onFieldChange=function(e){
  const el=e.target;
  const id=el.dataset.id;
  const field=el.dataset.field;
  const value=el.type==='number'?safeNum(el.value):el.value;
  ['lokala','garraioa'].forEach(cat=>{
    const i=state.amortizables[cat].findIndex(x=>x.id===id);
    if(i>-1){state.amortizables[cat][i][field]=value;}
  });
  ['lokala','ekoizpena','garraioa','hazkuntza'].forEach(cat=>{
    const i=state.recurrings[cat].findIndex(x=>x.id===id);
    if(i>-1){state.recurrings[cat][i][field]=value;}
  });
  const p=state.personnel.findIndex(x=>x.id===id);
  if(p>-1){state.personnel[p][field]=value;}
  renderAllTables();updateAll();
};

/* ===========================
   CÁLCULOS PRINCIPALES
   =========================== */
function updateAll(){
  let locInv=0, locAm=0, locRec=0, prodRec=0, transRec=0, growRec=0, perCost=0;
  state.amortizables.lokala.forEach(it=>{ locInv += safeNum(it.cost); locAm += safeNum(it.cost)/Math.max(1,safeNum(it.life)); });
  state.amortizables.garraioa.forEach(it=>{ transRec += safeNum(it.cost)/Math.max(1,safeNum(it.life)); });

  Object.keys(state.recurrings).forEach(cat=>{
    state.recurrings[cat].forEach(it=>{
      const ann = safeNum(it.payment_cost) * Math.max(1, safeNum(it.frequency));
      if(cat==='lokala') locRec += ann;
      if(cat==='ekoizpena') prodRec += ann;
      if(cat==='garraioa') transRec += ann;
      if(cat==='hazkuntza') growRec += ann;
    });
  });

  state.personnel.forEach(p=> perCost += safeNum(p.gross) * (1 + safeNum(p.employer_ss)/100) );

  // financial part (already numeric in state)
  const totalFin = safeNum(state.finance.totalFinancialCost);

  // totals numeric (sin formato)
  const totalFixed = locAm + locRec + perCost;
  const totalVariable = prodRec + transRec + growRec;
  const totalOperational = totalFixed + totalVariable + totalFin;

  // Helper to set formatted text AND store raw numeric in dataset.value
  const setFmtAndRaw = (id, value) => {
    const el = document.getElementById(id);
    if(!el) return;
    el.textContent = fmt(value);
    el.dataset.value = String(Number(value) || 0);
  };

  setFmtAndRaw('total-local-investment', locInv);
  setFmtAndRaw('total-local-amortization', locAm);
  setFmtAndRaw('total-local-recurring', locRec);
  setFmtAndRaw('total-local-annual-cost', locAm + locRec);

  setFmtAndRaw('total-production-cost', prodRec);
  setFmtAndRaw('total-transport-annual-cost', transRec + /* transport amortizations already added above? */ 0);
  setFmtAndRaw('total-growth-cost', growRec);

  setFmtAndRaw('total-personnel-cost', perCost);

  setFmtAndRaw('total-fixed-annual-cost', totalFixed);
  setFmtAndRaw('total-variable-annual-cost', totalVariable);
  setFmtAndRaw('total-financial-cost', totalFin);
  setFmtAndRaw('total-operational-cost', totalOperational);

  // Actualiza resumen derecho y recalcula precios dependientes
  updateRightSummary();
  // También recalcular el precio/hora por si total_operational cambió
  calculatePricing();
}

/* ===========================
   SALARIO / PRECIO HORA
   =========================== */
function calcNetSalary(){
  const gross=safeNum(qs('#grossSalary')?.value);
  const irpf=safeNum(qs('#irpfRate')?.value);
  const ss=gross*0.0635;
  const net=gross-(gross*irpf/100)-ss;
  qs('#netMonthlySalary').textContent=fmt(net/14);
  qs('#ssDeduction').textContent=fmt(ss);
}

function calculatePricing(){
  const margin=safeNum(qs('#target-profit-margin')?.value)||20;
  const emp=Math.max(1,safeNum(qs('#employee-count')?.value)||1);
  const hours=safeNum(qs('#annual-hours-per-employee')?.value)||1600;
  const totalHours=emp*hours;

  // Leer total desde el texto visible
  const totalCosts=Number((qs('#total-operational-cost')?.textContent||'').replace(/[^0-9\.-]/g,''))||0;

  const profit = totalCosts * (margin / 100);
  const revenue = totalCosts + profit;
  const suggested = totalHours > 0 ? revenue / totalHours : 0;

  // Actualizar interfaz
  qs('#total-available-hours').textContent = totalHours.toLocaleString();
  qs('#suggested-hourly-rate').textContent = fmt(suggested);
  qs('#expected-net-profit').textContent = fmt(profit);
  qs('#required-annual-revenue').textContent = fmt(revenue);

  // Sincronizar resumen lateral
  updateRightSummary(totalCosts, profit, revenue, suggested);
}

/* ===========================
   RESUMEN DERECHO
   =========================== */
function updateRightSummary(total = 0, profit = 0, revenue = 0, rate = 0) {
  const aside = document.querySelector('aside.sidebar');
  if (!aside) return;

  let c = document.getElementById('enhanced-summary');
  if (!c) {
    c = document.createElement('div');
    c.className = 'card';
    c.id = 'enhanced-summary';
    c.innerHTML = `
      <h4>Laburpen xehetuak</h4>
      <p>Urteko gastu osoa: <strong id="summary-operational-val">€ 0.00</strong></p>
      <p>Mozkin garbia: <strong id="summary-profit-val">€ 0.00</strong></p>
      <p>Fakturazio beharra: <strong id="summary-required-val">€ 0.00</strong></p>
      <p>Orduko prezioa: <strong id="summary-rate-val">€ 0.00</strong></p>
    `;
    aside.appendChild(c);
  }

  const set = (id, val) => {
    const e = document.getElementById(id);
    if (e) e.textContent = fmt(val);
  };

  // Actualiza directamente desde los valores recibidos (los mismos de ficha 7)
  set('summary-operational-val', total);
  set('summary-profit-val', profit);
  set('summary-required-val', revenue);
  set('summary-rate-val', rate);
}

/* ===========================
   PDF GENERATION
   =========================== */
async function generatePDFReport(){
  const overlay=document.getElementById('loading-overlay');
  if(overlay)overlay.style.display='flex';
  try{
    const node=document.querySelector('.panel:not([style*="display: none"])')||document.body;
    const canvas=await html2canvas(node,{scale:2,useCORS:true,backgroundColor:'#fff'});
    const img=canvas.toDataURL('image/png');
    const {jsPDF}=window.jspdf;
    const doc=new jsPDF('p','pt','a4');
    const w=doc.internal.pageSize.getWidth();
    const h=canvas.height*w/canvas.width;
    doc.addImage(img,'PNG',0,0,w,h);
    doc.setFontSize(9);
    const lang=localStorage.getItem('selectedLanguage')||'eu';
    const footer=(translations[lang]?.['footer.note'])||fallbackTranslations[lang]['footer.note'];
    doc.text(footer,40,doc.internal.pageSize.getHeight()-30);
    doc.save('IDarte_Aurrekontua.pdf');
  }catch(e){alert('Errorea sortzean PDF: '+e.message);}
  if(overlay)overlay.style.display='none';
}
/* ===========================
   DATOS INICIALES (basados en kodea (7))
   =========================== */
function preloadSampleData() {
  // --- AMORTIZABLES ---
  state.amortizables.lokala = [
    { id: uid('am'), name: 'Lokalaren Erosketa (Amortizagarria)', cost: 120000, life: 20, category: 'lokala' },
    { id: uid('am'), name: 'Erreformaren Balioa (Amortizagarria)', cost: 30000, life: 10, category: 'lokala' },
    { id: uid('am'), name: 'Altzarien Erosketa', cost: 8000, life: 5, category: 'lokala' },
    { id: uid('am'), name: 'Hardware eta Softwarearen Hornitzea', cost: 4000, life: 4, category: 'lokala' }
  ];

  state.amortizables.garraioa = [
    { id: uid('am'), name: 'Garraio Ibilgailuaren Erosketa', cost: 20000, life: 5, category: 'garraioa' }
  ];

  // --- GASTOS RECURRENTES ---
  state.recurrings.lokala = [
    { id: uid('r'), name: 'Alokairua (Hilekoa)', payment_cost: 800, frequency: 12, category: 'lokala' },
    { id: uid('r'), name: 'Hornigaiak: Gutxieneko Kontsumoa (Argia, Ura)', payment_cost: 100, frequency: 12, category: 'lokala' },
    { id: uid('r'), name: 'Erantzukizun Zibileko Asegurua (Urteko Prima FINKOA)', payment_cost: 600, frequency: 1, category: 'lokala' },
    { id: uid('r'), name: 'Zergak eta Udal Tasak (Lokala)', payment_cost: 1200, frequency: 1, category: 'lokala' },
    { id: uid('r'), name: 'Bestelako Aseguruak (Lokala)', payment_cost: 450, frequency: 1, category: 'lokala' },
    { id: uid('r'), name: 'Telefonia eta Internet FINKOA', payment_cost: 80, frequency: 12, category: 'lokala' }
  ];

  state.recurrings.ekoizpena = [
    { id: uid('r'), name: 'EZA (Proiektu Bakoltzeko Gehigarria)', payment_cost: 200, frequency: 12, category: 'ekoizpena' },
    { id: uid('r'), name: 'Hirugarrenen Lan Laguntzaileak (Proiektuko Azpikontratak)', payment_cost: 1500, frequency: 12, category: 'ekoizpena' },
    { id: uid('r'), name: 'Material Gordinak / Kontsumigarri Espezifikoak', payment_cost: 400, frequency: 12, category: 'ekoizpena' },
    { id: uid('r'), name: 'Elkargo Tasak (Jarduerari lotuak)', payment_cost: 150, frequency: 1, category: 'ekoizpena' }
  ];

  state.recurrings.garraioa = [
    { id: uid('r'), name: 'Garraioa: Mantentze-lanak eta Konponketak', payment_cost: 500, frequency: 1, category: 'garraioa' },
    { id: uid('r'), name: 'Garraioa: Udal Tasak eta Zergak (Urteko)', payment_cost: 150, frequency: 1, category: 'garraioa' },
    { id: uid('r'), name: 'Garraioa: Asegurua (Urteko)', payment_cost: 500, frequency: 1, category: 'garraioa' },
    { id: uid('r'), name: 'Garraioa: Erregaia / Gasolina', payment_cost: 250, frequency: 12, category: 'garraioa' },
    { id: uid('r'), name: 'Dietak / Bazkariak (Desplazamenduak)', payment_cost: 150, frequency: 12, category: 'garraioa' }
  ];

  state.recurrings.hazkuntza = [
    { id: uid('r'), name: 'Prestakuntza Saioak eta Ikastaroak', payment_cost: 800, frequency: 1, category: 'hazkuntza' },
    { id: uid('r'), name: 'Aldizkari eta Ikerketa Harpidetzak', payment_cost: 100, frequency: 12, category: 'hazkuntza' },
    { id: uid('r'), name: 'Komunikazioa Sareetan / Marketing digitala', payment_cost: 300, frequency: 12, category: 'hazkuntza' },
    { id: uid('r'), name: 'Patrozinioak / Networking Ekitaldiak', payment_cost: 500, frequency: 1, category: 'hazkuntza' }
  ];

  // --- PERSONAL ---
  state.personnel = [
    { id: uid('p'), role: 'Zuzendaria / Bazkidea', gross: 35000, employer_ss: 30 }
  ];

  // --- FINANZAS ---
  state.finance = {
    totalNeeded: 0,
    partnerCapital: [0, 0, 0],
    suggestedLoan: 0,
    loanAmount: 0,
    loanTAE: 5.0,
    loanTerm: 5,
    annualInterest: 0,
    capitalistNeeded: 0
  };

  // Render inicial
  renderAllTables();
  updateAll();
}

/* ===========================
  /* ===========================
   INIT + EVENTOS GLOBALES
   =========================== */
function bindGlobalInputs() {
  const sel = document.getElementById('language-select');
  if (sel) sel.addEventListener('change', e => applyTranslations(e.target.value));

  // Capital de socios → actualiza finanzas y totales
  ['partner-capital-1', 'partner-capital-2', 'partner-capital-3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => {
      updateAll();
      calculatePricing();
    });
  });

  // Préstamo → recalcula finanzas y costes
  ['loan-amount', 'loan-tae', 'loan-term'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => {
      updateAll();
      calculatePricing();
    });
  });

  // Salario neto → recalcula sueldo
  const gross = document.getElementById('grossSalary');
  const irpf = document.getElementById('irpfRate');
  if (gross) gross.addEventListener('input', calcNetSalary);
  if (irpf) irpf.addEventListener('input', calcNetSalary);

  // Precio/hora → recalcula horas y precio cada vez que cambian datos clave
  ['corporate-tax', 'target-profit-margin', 'employee-count', 'annual-hours-per-employee'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => {
      updateAll();
      calculatePricing();
    });
  });

  // Botón PDF
  const dl = document.getElementById('download-report-btn');
  if (dl) dl.addEventListener('click', generatePDFReport);
}

/* ===========================
   TABS / PESTAÑAS
   =========================== */
function initTabs() {
  const tabs = document.querySelectorAll('.tabs button');
  const panels = document.querySelectorAll('.panel');

  if (!tabs.length || !panels.length) return;

  tabs.forEach((tab, idx) => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      panels.forEach(p => p.style.display = 'none');
      if (panels[idx]) panels[idx].style.display = 'block';
      if (typeof updateRightSummary === 'function') updateRightSummary();
    });
  });

  // Mostrar primer panel por defecto
  if (tabs[0]) tabs[0].classList.add('active');
  panels.forEach((p, i) => p.style.display = i === 0 ? 'block' : 'none');
}

/* ===========================
   INIT PRINCIPAL
   =========================== */
async function init(){
  // Idioma inicial
  await loadTranslations(localStorage.getItem('selectedLanguage') || 'eu');

  // Construir paneles (por compatibilidad)
  buildPanelsIfEmpty();

  // Datos de ejemplo iniciales
  preloadSampleData();

  // Render de tablas
  renderAllTables();

  // Cálculos iniciales
  updateAll();

  // Inputs y botones
  bindGlobalInputs();

  // Tabs
  initTabs();

  // Selección de idioma actual
  const sel = document.getElementById('language-select');
  if (sel) sel.value = localStorage.getItem('selectedLanguage') || 'eu';
}

/* ===========================
   EJECUCIÓN AUTOMÁTICA AL CARGAR
   =========================== */
window.addEventListener('load', init);

