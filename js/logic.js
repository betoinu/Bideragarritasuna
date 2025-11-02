/* =========================================
// IDarte · Enpresa Gastuen Aurrekontua
// Lógica completa: datos, pestañas, cálculos,
// idioma, resumen y exportación a PDF
// =========================================

/* ============
  /* ============
   GLOBAL STATE
   ============ */
const state = {
  amortizables: { lokala: [], garraioa: [] },
  recurrings: { lokala: [], ekoizpena: [], garraioa: [], hazkuntza: [] },
  personnel: [],
  partners: [0,0,0],
  finance: { 
    totalNeeded: 0,
    partnerCapital: [0, 0, 0],
    suggestedLoan: 0,
    loanAmount: 0,
    loanTAE: 5.0,
    loanTerm: 5,
    annualInterest: 0,
    capitalistNeeded: 0,
    totalFinanceRaised: 0,
    financeDeficit: 0
  }
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
   CÁLCULOS FINANCIEROS
   =========================== */
function calculateTotalInitialInvestment() {
  let totalInvestment = 0;
  
  // 1. SUMAR TODAS LAS INVERSIONES EN ACTIVOS (coste completo)
  state.amortizables.lokala.forEach(item => {
    totalInvestment += safeNum(item.cost);
  });
  state.amortizables.garraioa.forEach(item => {
    totalInvestment += safeNum(item.cost);
  });
  
  // 2. CALCULAR CAPITALIZACIÓN (3 meses de gastos operativos)
  const operatingCosts = calculateOperatingCosts();
  const monthlyOperatingCost = operatingCosts / 12;
  const capitalizationNeeded = monthlyOperatingCost * 3;
  
  totalInvestment += capitalizationNeeded;
  
  return totalInvestment;
}

function calculateOperatingCosts() {
  let totalOperating = 0;
  
  // 1. Amortizaciones anuales
  state.amortizables.lokala.forEach(item => {
    totalOperating += safeNum(item.cost) / Math.max(1, safeNum(item.life));
  });
  state.amortizables.garraioa.forEach(item => {
    totalOperating += safeNum(item.cost) / Math.max(1, safeNum(item.life));
  });
  
  // 2. Gastos recurrentes anuales
  Object.values(state.recurrings).forEach(category => {
    category.forEach(item => {
      totalOperating += safeNum(item.payment_cost) * Math.max(1, safeNum(item.frequency));
    });
  });
  
  // 3. Costos de personal anuales
  state.personnel.forEach(person => {
    totalOperating += safeNum(person.gross) * (1 + safeNum(person.employer_ss) / 100);
  });
  
  // 4. Gastos financieros anuales
  totalOperating += state.finance.annualInterest || 0;
  
  return totalOperating;
}

function updateFinanceUI() {
  const totalPartnerCapital = state.partners.reduce((sum, capital) => sum + capital, 0);
  
  // Actualizar elementos financieros
  const setFmt = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = fmt(value);
  };
  
  setFmt('total-finance-needed', state.finance.totalNeeded);
  setFmt('total-partner-capital', totalPartnerCapital);
  setFmt('suggested-loan', state.finance.suggestedLoan);
  setFmt('total-finance-raised', state.finance.totalFinanceRaised);
  setFmt('finance-deficit', state.finance.financeDeficit);
  setFmt('annual-interest-cost', state.finance.annualInterest);
  setFmt('total-financial-cost', state.finance.annualInterest);
  
  // Mostrar/ocultar sección de socio capitalista
  const capitalistSection = document.getElementById('capitalist-partner-section');
  const capitalistNeededEl = document.getElementById('capitalist-needed');
  
  if (capitalistSection && capitalistNeededEl) {
    if (state.finance.capitalistNeeded > 0) {
      capitalistSection.classList.remove('hidden');
      capitalistNeededEl.textContent = fmt(state.finance.capitalistNeeded);
    } else {
      capitalistSection.classList.add('hidden');
    }
  }
  
  // Actualizar estado financiero
  updateFinanceStatus();
}

function updateFinanceStatus() {
  const statusCard = document.getElementById('finance-status-card');
  const statusElement = document.getElementById('finance-status');
  const messageElement = document.getElementById('finance-message');

  if (!statusCard || !statusElement || !messageElement) return;

  // Resetear clases
  statusCard.className = 'result-card';
  
  if (state.finance.financeDeficit === 0) {
    statusCard.classList.add('border-green-600', 'bg-green-50');
    statusElement.textContent = "FINANTAATUTA";
    statusElement.className = "text-xl font-extrabold text-green-800 mt-1";
    messageElement.textContent = "Finantzaketa behar osoa estaltzen da";
  } else if (state.finance.financeDeficit <= state.finance.totalNeeded * 0.1) {
    statusCard.classList.add('border-yellow-600', 'bg-yellow-50');
    statusElement.textContent = "IA FINANTAATUTA";
    statusElement.className = "text-xl font-extrabold text-yellow-800 mt-1";
    messageElement.textContent = "Defizit txikia, erraz konpon datieke";
  } else {
    statusCard.classList.add('border-red-600', 'bg-red-50');
    statusElement.textContent = "DEFIZIT HANDIA";
    statusElement.className = "text-xl font-extrabold text-red-800 mt-1";
    messageElement.textContent = "Finantzaketa gehiago behar da";
  }
}

/* ===========================
   CÁLCULO DE COSTOS TOTALES
   =========================== */
function calculateTotalCosts() {
  let total = 0;
  
  // 1. Sumar amortizaciones de lokala
  state.amortizables.lokala.forEach(item => {
    total += safeNum(item.cost) / Math.max(1, safeNum(item.life));
  });
  
  // 2. Sumar amortizaciones de garraioa
  state.amortizables.garraioa.forEach(item => {
    total += safeNum(item.cost) / Math.max(1, safeNum(item.life));
  });
  
  // 3. Sumar gastos recurrentes de todas las categorías
  Object.values(state.recurrings).forEach(category => {
    category.forEach(item => {
      total += safeNum(item.payment_cost) * Math.max(1, safeNum(item.frequency));
    });
  });
  
  // 4. Sumar costos de personal
  state.personnel.forEach(person => {
    total += safeNum(person.gross) * (1 + safeNum(person.employer_ss) / 100);
  });
  
  // 5. Sumar gastos financieros (intereses del préstamo)
  const loanAmount = safeNum(document.getElementById('loan-amount')?.value) || 0;
  const loanTAE = safeNum(document.getElementById('loan-tae')?.value) || 5;
  const annualInterest = loanAmount * (loanTAE / 100);
  total += annualInterest;
  
  return total;
}

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
   FINANCIACIÓN ESTRATEGIA
   =========================== */
window.updateFinanceStrategy = function() {
  // 1. Obtener aportaciones de socios
  state.partners[0] = safeNum(document.getElementById('partner-capital-1')?.value);
  state.partners[1] = safeNum(document.getElementById('partner-capital-2')?.value);
  state.partners[2] = safeNum(document.getElementById('partner-capital-3')?.value);
  
  const totalPartnerCapital = state.partners.reduce((sum, capital) => sum + capital, 0);
  
  // 2. CALCULAR FINANCIACIÓN NECESARIA TOTAL (INVERSIÓN INICIAL)
  state.finance.totalNeeded = calculateTotalInitialInvestment();
  
  // 3. Calcular préstamo sugerido
  state.finance.suggestedLoan = Math.max(0, state.finance.totalNeeded - totalPartnerCapital);
  
  // 4. Calcular necesidad de socio capitalista
  state.finance.capitalistNeeded = Math.max(0, state.finance.totalNeeded - totalPartnerCapital - (state.finance.loanAmount || 0));
  
  // 5. Calcular financiación obtenida y déficit
  state.finance.totalFinanceRaised = totalPartnerCapital + (state.finance.loanAmount || 0);
  state.finance.financeDeficit = Math.max(0, state.finance.totalNeeded - state.finance.totalFinanceRaised);
  
  // 6. ACTUALIZAR INTERFAZ
  updateFinanceUI();
  
  // 7. Auto-completar préstamo si está en 0
  const loanAmountInput = document.getElementById('loan-amount');
  if (loanAmountInput && safeNum(loanAmountInput.value) === 0 && state.finance.suggestedLoan > 0) {
    loanAmountInput.value = state.finance.suggestedLoan;
    state.finance.loanAmount = state.finance.suggestedLoan;
  }
};

window.updateLoanCalculation = function() {
  state.finance.loanAmount = safeNum(document.getElementById('loan-amount')?.value);
  state.finance.loanTAE = safeNum(document.getElementById('loan-tae')?.value) || 5.0;
  state.finance.loanTerm = safeNum(document.getElementById('loan-term')?.value) || 5;

  const monthlyRate = (state.finance.loanTAE / 100) / 12;
  const numberOfPayments = state.finance.loanTerm * 12;

  if (state.finance.loanAmount > 0 && monthlyRate > 0) {
    const monthlyPayment = state.finance.loanAmount * monthlyRate * 
      Math.pow(1 + monthlyRate, numberOfPayments) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    const totalPayment = monthlyPayment * numberOfPayments;
    state.finance.annualInterest = (totalPayment - state.finance.loanAmount) / state.finance.loanTerm;
  } else {
    state.finance.annualInterest = 0;
  }

  // Actualizar interfaz y cálculos
  updateFinanceUI();
  updateAll();
};

/* ===========================
   CÁLCULOS PRINCIPALES - CORREGIDA
   =========================== */
function updateAll() {
  // Calcular costos por categoría para mostrar en tablas
  let locInv = 0, locAm = 0, locRec = 0, prodRec = 0, transRec = 0, growRec = 0, perCost = 0;
  
  // Amortizaciones lokala
  state.amortizables.lokala.forEach(it => { 
    locInv += safeNum(it.cost); 
    locAm += safeNum(it.cost) / Math.max(1, safeNum(it.life)); 
  });
  
  // Amortizaciones garraioa (se consideran como gasto recurrente anual)
  state.amortizables.garraioa.forEach(it => { 
    transRec += safeNum(it.cost) / Math.max(1, safeNum(it.life)); 
  });

  // Gastos recurrentes por categoría
  state.recurrings.lokala.forEach(it => {
    locRec += safeNum(it.payment_cost) * Math.max(1, safeNum(it.frequency));
  });
  
  state.recurrings.ekoizpena.forEach(it => {
    prodRec += safeNum(it.payment_cost) * Math.max(1, safeNum(it.frequency));
  });
  
  state.recurrings.garraioa.forEach(it => {
    transRec += safeNum(it.payment_cost) * Math.max(1, safeNum(it.frequency));
  });
  
  state.recurrings.hazkuntza.forEach(it => {
    growRec += safeNum(it.payment_cost) * Math.max(1, safeNum(it.frequency));
  });

  // Costos de personal
  state.personnel.forEach(p => {
    perCost += safeNum(p.gross) * (1 + safeNum(p.employer_ss) / 100);
  });

  // Calcular gastos financieros
  const loanAmount = safeNum(document.getElementById('loan-amount')?.value) || 0;
  const loanTAE = safeNum(document.getElementById('loan-tae')?.value) || 5;
  const annualInterest = loanAmount * (loanTAE / 100);
  state.finance.annualInterest = annualInterest;
  state.finance.totalFinancialCost = annualInterest;

  // Totales
  const totalFixed = locAm + locRec + perCost;
  const totalVariable = prodRec + transRec + growRec;
  const totalFinancial = annualInterest;
  const totalOperational = totalFixed + totalVariable + totalFinancial;

  // Actualizar valores en la interfaz
  const setFmt = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = fmt(value);
  };

  setFmt('total-operational-cost', totalOperational);

  // Actualizar resumen y cálculos de precio
  updateRightSummary(totalOperational);
  calculatePricing(totalOperational);
 if (typeof updateFinanceStrategy === 'function') {
    updateFinanceStrategy();
  }
}

/* ===========================
   SALARIO / PRECIO HORA - CORREGIDA
   =========================== */
function calculatePricing(totalOperational = null) {
    console.log("🎯 Calculando pricing con márgenes diferenciados...");
    
    if (totalOperational === null) {
        totalOperational = calculateTotalCosts();
    }
    
    const margin = safeNum(qs('#target-profit-margin')?.value) || 20;
    const corporateTax = safeNum(qs('#corporate-tax')?.value) || 25;
    const emp = Math.max(1, safeNum(qs('#employee-count')?.value) || 1);
    const hours = safeNum(qs('#annual-hours-per-employee')?.value) || 1600;
    const totalHours = emp * hours;

        // Calcular costos financieros COMPLETOS (intereses + amortización)
    let costosFinancieros = calcularCostesFinancierosCompletos();

    console.log("📊 Datos para pricing:", {
        totalOperational,
        margin,
        corporateTax,
        costosFinancieros
    });

    // MARGEN BRUTO (antes de impuestos e intereses)
    const margenBruto = totalOperational * (margin / 100);
    
    // MARGEN NETO (después de impuestos)
    const beneficioAntesImpuestos = margenBruto - costosFinancieros;
    const impuestos = Math.max(0, beneficioAntesImpuestos * (corporateTax / 100));
    const margenNeto = beneficioAntesImpuestos - impuestos;

    const revenue = totalOperational + margenBruto;
    const suggested = totalHours > 0 ? revenue / totalHours : 0;

    // Actualizar interfaz PANEL 7
    const setFmt = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = fmt(value);
    };

    setFmt('total-available-hours', totalHours);
    setFmt('suggested-hourly-rate', suggested);
    setFmt('expected-net-profit', margenNeto); // Ahora muestra margen NETO
    setFmt('required-annual-revenue', revenue);
    
    // Guardar valores para el sidebar
    document.getElementById('suggested-hourly-rate').dataset.value = suggested;
    document.getElementById('expected-net-profit').dataset.value = margenNeto;
    document.getElementById('required-annual-revenue').dataset.value = revenue;
    document.getElementById('total-available-hours').dataset.value = totalHours;

// NUEVA FUNCIÓN: Calcular costes financieros completos usando "Urteko Kuota Guztira"
function calcularCostesFinancierosCompletos() {
    let costesTotales = 0;
    
    // USAR DIRECTAMENTE "Urteko Kuota Guztira" que ya incluye intereses + amortización
    const cuotaAnualSpan = document.getElementById('cuota-anual');
    if (cuotaAnualSpan) {
        const cuotaText = cuotaAnualSpan.textContent;
        costesTotales = safeNum(cuotaText.replace(/[^\d.,]/g, '').replace(',', '.'));
        console.log("💰 Costes financieros completos (de cuota-anual):", costesTotales);
    } else {
        console.warn("❌ No se encontró 'cuota-anual'");
    }
    
    return costesTotales;
}

// AÑADE esta nueva función después de calculatePricing
function updateRightSummaryWithMargins(totalOperational, margenBruto, costosFinancieros) {
  
    // Actualizar sidebar con márgenes diferenciados
    updateRightSummaryWithMargins(totalOperational, margenBruto, costosFinancieros);
    
    console.log("✅ Pricing calculado:", {
        margenBruto,
        margenNeto,
        revenue,
        suggested
    });
}

// AÑADE esta nueva función después de calculatePricing
function updateRightSummaryWithMargins(totalOperational, margenBruto, costosFinancieros) {
    console.log("🔄 Actualizando sidebar con márgenes...");
    
    const actualizarElemento = (id, valor, esMoneda = true) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = esMoneda ? fmt(valor) : valor;
            console.log(`✅ ${id}: ${elemento.textContent}`);
        } else {
            console.warn(`❌ Elemento no encontrado: ${id}`);
        }
    };

    const requiredRevenue = safeNum(document.getElementById('required-annual-revenue')?.dataset.value) || 0;
    
    actualizarElemento('total-facturacion', requiredRevenue);
    actualizarElemento('gastos-operativos', totalOperational);
    actualizarElemento('costos-financieros', costosFinancieros);
    actualizarElemento('margen-bruto', margenBruto); // Ahora muestra margen BRUTO real
    
    console.log("📈 Márgenes actualizados en sidebar:", {
        totalOperational,
        margenBruto,
        costosFinancieros,
        requiredRevenue
    });
}

/* ===========================
   /* ===========================
   SIDEBAR MEJORADO - CORREGIDO Y ROBUSTO
   =========================== */
function updateRightSummary(totalOperational = null) {
    console.log("🔄 Actualizando sidebar principal...");
    
    if (totalOperational === null) {
        totalOperational = calculateTotalCosts();
    }
    
        // Calcular costos financieros COMPLETOS (intereses + amortización)
    let costosFinancieros = calcularCostesFinancierosCompletos();
    
    console.log("💰 Costos financieros calculados:", costosFinancieros);

    // Obtener valores de pricing
    let suggestedRate = 0;
    let requiredRevenue = 0;
    let totalHours = 0;

    try {
        suggestedRate = safeNum(document.getElementById('suggested-hourly-rate')?.dataset.value) || 0;
        requiredRevenue = safeNum(document.getElementById('required-annual-revenue')?.dataset.value) || 0;
        
        const totalHoursEl = document.getElementById('total-available-hours');
        if (totalHoursEl) {
            totalHours = safeNum(totalHoursEl.dataset.value) || 0;
        }
    } catch (error) {
        console.warn("❌ Error obteniendo datos de pricing:", error);
    }

    // Calcular márgenes
    const margin = safeNum(document.getElementById('target-profit-margin')?.value) || 20;
    const margenBruto = totalOperational * (margin / 100);

    // LANGILE KOPURUA - de state.personnel (REAL)
    const employeeCount = state.personnel.length;

    // Calcular desglose de costes
    const desgloseCostes = calcularDesgloseCostes();

    console.log("📊 Datos sidebar:", {
        totalOperational,
        requiredRevenue,
        suggestedRate,
        employeeCount,
        costosFinancieros,
        margenBruto
    });

    // Actualizar sidebar - MÉTODO ROBUSTO
    const actualizarElemento = (id, valor, esMoneda = true) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = esMoneda ? fmt(valor) : valor;
        } else {
            console.warn(`Elemento no encontrado: ${id}`);
        }
    };

    // Card 1: Facturación Principal
    actualizarElemento('total-facturacion', requiredRevenue);
    actualizarElemento('gastos-operativos', totalOperational);
    actualizarElemento('costos-financieros', costosFinancieros);
    actualizarElemento('margen-bruto', margenBruto);

    // Card 2: Precio/Hora
    actualizarElemento('suggested-hourly-rate-sidebar', suggestedRate);
    actualizarElemento('employee-count-sidebar', employeeCount, false);
    actualizarElemento('annual-hours-sidebar', totalHours.toLocaleString(), false);

    // Card 3: Desglose de Costes
    actualizarElemento('total-amortizaciones', desgloseCostes.amortizaciones);
    actualizarElemento('total-gastos-fijos', desgloseCostes.gastosFijos);
    actualizarElemento('total-personal', desgloseCostes.personal);
    actualizarElemento('total-intereses', costosFinancieros);

    console.log("✅ Sidebar actualizado correctamente");
}

/* ===========================
   FUNCIONES FALTANTES - SIDEBAR
   =========================== */
function calcularDesgloseCostes() {
    let amortizaciones = 0;
    let gastosFijos = 0;
    let personal = 0;

    // Amortizaciones
    state.amortizables.lokala.forEach(item => {
        amortizaciones += safeNum(item.cost) / Math.max(1, safeNum(item.life));
    });
    state.amortizables.garraioa.forEach(item => {
        amortizaciones += safeNum(item.cost) / Math.max(1, safeNum(item.life));
    });

    // Gastos fijos (recurrentes)
    Object.values(state.recurrings).forEach(category => {
        category.forEach(item => {
            gastosFijos += safeNum(item.payment_cost) * Math.max(1, safeNum(item.frequency));
        });
    });

    // Personal
    state.personnel.forEach(person => {
        personal += safeNum(person.gross) * (1 + safeNum(person.employer_ss) / 100);
    });

    return { amortizaciones, gastosFijos, personal };
}

function debugSidebar() {
    console.log("=== 🔍 DEBUG SIDEBAR ===");
    
    // Verificar que los elementos existen
    const elementos = [
        'total-facturacion', 'gastos-operativos', 'costos-financieros', 'margen-bruto',
        'suggested-hourly-rate-sidebar', 'employee-count-sidebar', 'annual-hours-sidebar',
        'total-amortizaciones', 'total-gastos-fijos', 'total-personal', 'total-intereses'
    ];
    
    elementos.forEach(id => {
        const el = document.getElementById(id);
        console.log(`${id}:`, el ? "✅ EXISTE" : "❌ NO EXISTE");
    });
    
    // Verificar datos de cálculo
    const totalOperational = calculateTotalCosts();
    const requiredRevenue = safeNum(document.getElementById('required-annual-revenue')?.dataset.value) || 0;
    
    console.log("📊 Datos calculados:", {
        totalOperational,
        requiredRevenue
    });
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
   BIND GLOBAL INPUTS - CORREGIDO
   =========================== */
function bindGlobalInputs() {
    console.log("🔧 Configurando event listeners...");
    
    // Selector de idioma - SOLO UNA FORMA
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        // Eliminar cualquier event listener anterior
        languageSelect.replaceWith(languageSelect.cloneNode(true));
        const newSelect = document.getElementById('language-select');
        
        newSelect.addEventListener('change', e => {
            applyTranslations(e.target.value);
        });
        console.log("✅ Selector de idioma configurado");
    }

    // Botón PDF - SOLO event listener, no onclick
    const dl = document.getElementById('download-report-btn');
    if (dl) {
        dl.addEventListener('click', generatePDFReport);
        console.log("✅ Botón PDF configurado");
    }
    
    // Inputs de capital de socios
    ['partner-capital-1', 'partner-capital-2', 'partner-capital-3'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', updateAll);
        }
    });

    // Inputs de préstamo
    ['loan-amount', 'loan-tae', 'loan-term'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', updateAll);
        }
    });

    // Inputs de pricing
    ['corporate-tax', 'target-profit-margin', 'employee-count', 'annual-hours-per-employee'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => {
                const totalOperational = calculateTotalCosts();
                calculatePricing(totalOperational);
                updateRightSummary(totalOperational);
            });
        }
    });

    console.log("✅ Todos los event listeners configurados");
}

function bindFinantzaketaInputs() {
    console.log("🔧 Configurando event listeners para panel 6...");
    
    // Porcentaje de tesorería
    const porcentajeTesoreria = document.getElementById('porcentaje-tesoreria');
    if (porcentajeTesoreria) {
        porcentajeTesoreria.addEventListener('input', function() {
            console.log("📊 Porcentaje tesorería cambiado:", this.value);
            if (typeof calcularFinanciacion === 'function') {
                calcularFinanciacion();
            }
            updateAll();
        });
        console.log("✅ Listener añadido a porcentaje-tesoreria");
    }
    
    // Otros inputs del panel 6
    const inputsFinantzaketa = [
        'necesidades-inversion', 'tipo-prestamo', 'tae', 'plazo'
    ];
    
    inputsFinantzaketa.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', function() {
                console.log(`📊 ${id} cambiado:`, this.value);
                if (typeof calcularFinanciacion === 'function') {
                    calcularFinanciacion();
                }
                updateAll();
            });
            console.log(`✅ Listener añadido a ${id}`);
        }
    });
    
    // Inputs de capital de socios (ya deberían existir, pero por si acaso)
    document.querySelectorAll('.capital-input').forEach(input => {
        input.addEventListener('input', function() {
            console.log("📊 Capital socio cambiado");
            if (typeof calcularFinanciacion === 'function') {
                calcularFinanciacion();
            }
            updateAll();
        });
    });
    
    // Inputs de socios capitalistas
    document.querySelectorAll('.capitalista-input').forEach(input => {
        input.addEventListener('input', function() {
            console.log("📊 Capitalista cambiado");
            if (typeof calcularFinanciacion === 'function') {
                calcularFinanciacion();
            }
            updateAll();
        });
    });
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

async function init(){
  console.log("🚀 Iniciando aplicación con mejoras...");
  
  // 1. Cargar idioma
  await loadTranslations(localStorage.getItem('selectedLanguage') || 'eu');

  // 2. Construir paneles y datos
  buildPanelsIfEmpty();
  preloadSampleData();
  renderAllTables();

  // 3. Inicializar interfaz
  initTabs();
  bindGlobalInputs();
  
  // 4. NUEVO: Configurar event listeners para panel 6
  bindFinantzaketaInputs();

  // 5. Inicializar panel de finantzaketa SI EXISTE
  if (typeof initFinantzaketaPanel === 'function') {
      console.log("✅ Inicializando panel finantzaketa");
      initFinantzaketaPanel();
  }

  // 6. Cálculos iniciales (con delay para asegurar que el DOM esté listo)
  setTimeout(() => {
      console.log("🔄 Ejecutando cálculos iniciales...");
      
      // Forzar cálculo de financiación si existe
      if (typeof calcularFinanciacion === 'function') {
          console.log("💰 Calculando financiación inicial...");
          calcularFinanciacion();
      }
      
      // Actualización completa
      updateAll();
      
      // Verificar que todo funciona
      verificarMejoras();
  }, 800);

  // 7. Configurar selector de idioma
  const sel = document.getElementById('language-select');
  if (sel) sel.value = localStorage.getItem('selectedLanguage') || 'eu';

  console.log("✅ Aplicación inicializada correctamente con todas las mejoras");
}

// ===== FINANZAKETA PANEL FUNCTIONS =====

let socioCount = 3;
let capitalistaCount = 0;

// Inicializar panel de finantzaketa
function initFinantzaketaPanel() {
    // Actualizar número de socios
    updateNumSocios(socioCount);
    
    // Añadir eventos a los botones
    document.getElementById('add-socio')?.addEventListener('click', addSocio);
    document.getElementById('remove-socio')?.addEventListener('click', removeSocio);
    document.getElementById('add-capitalista')?.addEventListener('click', addCapitalista);
    
    // Calcular financiación inicial
    calcularFinanciacion();
}

// Actualizar número de socios
function updateNumSocios(n) {
    socioCount = n;
    const numSociosSpan = document.getElementById('num-socios');
    if (numSociosSpan) numSociosSpan.textContent = n;
    
    const tbody = document.getElementById('socios-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    for (let i = 1; i <= socioCount; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>Bazkide ${i}</td>
            <td><input type="number" value="0" min="0" class="capital-input" oninput="updateAll()"></td>
        `;
        tbody.appendChild(row);
    }
    
    calcularFinanciacion();
}

// Añadir socio
function addSocio() {
    updateNumSocios(socioCount + 1);
}

// Eliminar socio
function removeSocio() {
    if (socioCount > 1) {
        updateNumSocios(socioCount - 1);
    } else {
        alert('Gutxienez bazkide bat egon behar da');
    }
}

// Añadir socio capitalista
function addCapitalista() {
    capitalistaCount++;
    const tbody = document.getElementById('capitalistas-table-body');
    if (!tbody) return;
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>Kapitalista Bazkidea ${capitalistaCount}</td>
        <td><input type="number" value="0" min="0" class="capitalista-input" oninput="updateAll()"></td>
        <td><button class="btn small" onclick="removeCapitalista(this)">Ezabatu</button></td>
    `;
    tbody.appendChild(row);
    
    calcularFinanciacion();
}

// Eliminar socio capitalista
function removeCapitalista(button) {
    const row = button.closest('tr');
    if (row) {
        row.remove();
        capitalistaCount--;
        calcularFinanciacion();
    }
}

// Calcular financiación con tesorería - VERSIÓN MEJORADA
function calcularFinanciacion() {
    console.log("💰 Calculando financiación...");
    
    // Calcular total aportado por socios
    let totalSocios = 0;
    document.querySelectorAll('.capital-input').forEach(input => {
        totalSocios += parseFloat(input.value) || 0;
    });
    
    // Calcular total aportado por socios capitalistas
    let totalCapitalistas = 0;
    document.querySelectorAll('.capitalista-input').forEach(input => {
        totalCapitalistas += parseFloat(input.value) || 0;
    });
    
    // Obtener necesidades de inversión base
    const necesidadesInput = document.getElementById('necesidades-inversion');
    const necesidadesInversionBase = necesidadesInput ? parseFloat(necesidadesInput.value) || 0 : 0;
    
    // CALCULAR TESORERÍA (financiación de gastos anuales)
    const porcentajeTesoreria = parseFloat(document.getElementById('porcentaje-tesoreria')?.value) || 0;
    const gastosAnualesTotales = calculateTotalCosts();
    const importeTesoreria = gastosAnualesTotales * (porcentajeTesoreria / 100);
    
    // Calcular necesidades TOTALES de inversión (base + tesorería)
    const necesidadesInversionTotales = necesidadesInversionBase + importeTesoreria;
    
    // Calcular cantidad a financiar
    let cantidadFinanciar = necesidadesInversionTotales - totalSocios - totalCapitalistas;
    cantidadFinanciar = Math.max(0, cantidadFinanciar);
    
    // Calcular costos financieros
    const tae = parseFloat(document.getElementById('tae')?.value) || 0;
    const plazo = parseFloat(document.getElementById('plazo')?.value) || 1;
    
    const tasaMensual = (tae / 100) / 12;
    const numPagos = plazo * 12;
    
    let cuotaMensual = 0;
    let interesAnual = 0;
    let cuotaAnual = 0;
    
    if (tasaMensual > 0 && cantidadFinanciar > 0) {
        cuotaMensual = cantidadFinanciar * tasaMensual * Math.pow(1 + tasaMensual, numPagos) / 
                      (Math.pow(1 + tasaMensual, numPagos) - 1);
        cuotaAnual = cuotaMensual * 12;
        interesAnual = cuotaAnual - (cantidadFinanciar / plazo);
    } else if (cantidadFinanciar > 0) {
        cuotaMensual = cantidadFinanciar / numPagos;
        cuotaAnual = cuotaMensual * 12;
        interesAnual = 0;
    }
    
    console.log("📊 Resultados financiación:", {
        totalSocios,
        totalCapitalistas,
        importeTesoreria,
        cantidadFinanciar,
        interesAnual
    });
    
    // Actualizar la interfaz
    const totalSociosSpan = document.getElementById('total-socios');
    const totalCapitalistasSpan = document.getElementById('total-capitalistas');
    const cantidadFinanciarSpan = document.getElementById('cantidad-financiar');
    const cuotaMensualSpan = document.getElementById('cuota-mensual');
    const interesAnualSpan = document.getElementById('interes-anual');
    const cuotaAnualSpan = document.getElementById('cuota-anual');
    const importeTesoreriaSpan = document.getElementById('importe-tesoreria');
    const importeTesoreriaDisplaySpan = document.getElementById('importe-tesoreria-display');
    
    if (totalSociosSpan) totalSociosSpan.textContent = fmt(totalSocios);
    if (totalCapitalistasSpan) totalCapitalistasSpan.textContent = fmt(totalCapitalistas);
    if (cantidadFinanciarSpan) cantidadFinanciarSpan.textContent = fmt(cantidadFinanciar);
    if (cuotaMensualSpan) cuotaMensualSpan.textContent = fmt(cuotaMensual);
    if (interesAnualSpan) interesAnualSpan.textContent = fmt(interesAnual);
    if (cuotaAnualSpan) cuotaAnualSpan.textContent = fmt(cuotaAnual);
    if (importeTesoreriaSpan) importeTesoreriaSpan.textContent = fmt(importeTesoreria);
    if (importeTesoreriaDisplaySpan) importeTesoreriaDisplaySpan.textContent = fmt(importeTesoreria);
    
    // Actualizar también el input de necesidades para mantener consistencia
    if (necesidadesInput) {
        necesidadesInput.value = necesidadesInversionBase;
    }
    
    // NUEVO: Forzar actualizaciones después de calcular financiación
    console.log("✅ Financiación calculada, actualizando interfaz...");
    
    // Actualizar sidebar y pricing después de un breve delay
    setTimeout(() => {
        try {
            const totalOperational = calculateTotalCosts();
            console.log("🔄 Actualizando sidebar después de financiación...");
            updateRightSummary(totalOperational);
            calculatePricing(totalOperational);
        } catch (error) {
            console.warn("⚠️ Error en actualización post-financiación:", error);
        }
    }, 150);
}

// Actualizar sidebar con facturación (usando la función existente de pricing)
function updateSidebarWithFacturacion() {
    const totalOperational = calculateTotalCosts();
    calculatePricing(totalOperational);
    
    const aside = document.querySelector('aside.sidebar');
    if (!aside) return;
    
    // Actualizar el card existente de "Laburpen Orokorra"
    const summaryCard = document.querySelector('.card h4');
    if (summaryCard && summaryCard.textContent.includes('Laburpen Orokorra')) {
        const card = summaryCard.closest('.card');
        if (card) {
            const subtitle = card.querySelector('.muted');
            if (subtitle) {
                subtitle.textContent = 'Urteko fakturazioa beharrezkoa (Gastu guztiak + Interesak + Mozkina + Sozietateen Zergak)';
            }
        }
    }
}

/* ===========================
   DEBUG TEMPORAL - SIDEBAR
   =========================== */
function debugSidebar() {
    console.log("=== DEBUG SIDEBAR ===");
    
    // Verificar que los elementos existen
    const elementos = [
        'total-facturacion', 'gastos-operativos', 'costos-financieros', 'margen-bruto',
        'suggested-hourly-rate-sidebar', 'employee-count-sidebar', 'annual-hours-sidebar',
        'total-amortizaciones', 'total-gastos-fijos', 'total-personal', 'total-intereses'
    ];
    
    elementos.forEach(id => {
        const el = document.getElementById(id);
        console.log(`${id}:`, el ? "✅ EXISTE" : "❌ NO EXISTE");
    });
    
    // Verificar datos de cálculo
    const totalOperational = calculateTotalCosts();
    const requiredRevenue = safeNum(document.getElementById('required-annual-revenue')?.dataset.value) || 0;
    
    console.log("Datos calculados:", {
        totalOperational,
        requiredRevenue
    });
}

// Llamar al debug después de init
setTimeout(debugSidebar, 1000);

/* ===========================
   EJECUCIÓN AUTOMÁTICA AL CARGAR
   =========================== */
window.addEventListener('load', init);

