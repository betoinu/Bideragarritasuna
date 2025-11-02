/* =========================================
// IDarte · Enpresa Gastuen Aurrekontua
// Lógica completa para 7 paneles - VERSIÓN COMPLETA
// ========================================= */

/* ============
   GLOBAL STATE
   ============ */
const state = {
  amortizables: { lokala: [], garraioa: [] },
  recurrings: { lokala: [], ekoizpena: [], garraioa: [], hazkuntza: [] },
  personnel: [],
  partners: [0, 0, 0],
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
   TRADUCCIONES
   ============================== */
let translations = {
  eu: {
    "header.title": "IDarte · Euskadiko Diseinu Eskola Publikoa",
    "header.subtitle": "BARNE DISEINU GRADUA - Neurketak eta Aurrekontuak",
    "button.download": "Deskargatu",
    "tab.lokal": "1 · Lokal",
    "tab.pertsonala": "2 · Pertsonala",
    "tab.ekoizpena": "3 · Ekoizpena",
    "tab.garraioa": "4 · Garraioa",
    "tab.hazkuntza": "5 · Hazkuntza",
    "tab.finantzaketa": "6 · Finantzaketa",
    "tab.prezioa": "7 · Prezioa",
    "summary.title": "Laburpen Orokorra",
    "summary.subtitle": "Aurrekontu globala",
    "footer.note": "IDarte · Euskadiko Diseinu Eskola Publikoa",
    "loading": "Txostena prestatzen...",
    "finance.status.funded": "FINANTAATUTA",
    "finance.status.almost": "IA FINANTAATUTA", 
    "finance.status.deficit": "DEFIZIT HANDIA"
  },
  es: {
    "header.title": "IDarte · Escuela Pública de Diseño de Euskadi",
    "header.subtitle": "GRADO EN DISEÑO DE INTERIORES - Mediciones y Presupuestos",
    "button.download": "Descargar",
    "tab.lokal": "1 · Local",
    "tab.pertsonala": "2 · Personal",
    "tab.ekoizpena": "3 · Producción",
    "tab.garraioa": "4 · Transporte",
    "tab.hazkuntza": "5 · Crecimiento",
    "tab.finantzaketa": "6 · Financiación",
    "tab.prezioa": "7 · Precio/Hora",
    "summary.title": "Resumen General",
    "summary.subtitle": "Presupuesto global",
    "footer.note": "IDarte · Escuela Pública de Diseño de Euskadi",
    "loading": "Preparando el informe...",
    "finance.status.funded": "FINANCIADO",
    "finance.status.almost": "CASI FINANCIADO",
    "finance.status.deficit": "DÉFICIT GRANDE"
  }
};

/* =====================
   UTILIDADES BÁSICAS
   ===================== */
function uid(prefix = 'id') {
  return prefix + '-' + Math.random().toString(36).slice(2, 9);
}

function fmt(n) {
  n = Number(n) || 0;
  try {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n);
  } catch (e) {
    return '€' + n.toFixed(2);
  }
}

function safeNum(v) {
  return Number(v || 0) || 0;
}

function qs(sel) {
  return document.querySelector(sel);
}

function qsa(sel) {
  return Array.from(document.querySelectorAll(sel));
}

/* ===========================
   SISTEMA DE IDIOMAS
   =========================== */
function applyTranslations(lang) {
  const strings = translations[lang] || translations.eu;
  qsa('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (strings[key]) el.textContent = strings[key];
  });
  
  // Actualizar botón de descarga
  const dl = document.getElementById('download-report-btn');
  if (dl) dl.textContent = strings['button.download'];
  
  document.documentElement.lang = lang;
  localStorage.setItem('selectedLanguage', lang);
}

/* ===========================
   CÁLCULOS BÁSICOS MEJORADOS
   =========================== */
function calculateTotalCosts() {
  let total = 0;

  // 1. Amortizaciones lokala
  state.amortizables.lokala.forEach(item => {
    total += safeNum(item.cost) / Math.max(1, safeNum(item.life));
  });
  
  // 2. Amortizaciones garraioa
  state.amortizables.garraioa.forEach(item => {
    total += safeNum(item.cost) / Math.max(1, safeNum(item.life));
  });

  // 3. Gastos recurrentes de todas las categorías
  Object.values(state.recurrings).forEach(category => {
    category.forEach(item => {
      total += safeNum(item.payment_cost) * Math.max(1, safeNum(item.frequency));
    });
  });

  // 4. Costos de personal
  state.personnel.forEach(person => {
    total += safeNum(person.gross) * (1 + safeNum(person.employer_ss) / 100);
  });

  // 5. Gastos financieros (intereses del préstamo)
  const loanAmount = safeNum(document.getElementById('loan-amount')?.value) || 0;
  const loanTAE = safeNum(document.getElementById('loan-tae')?.value) || 5;
  const annualInterest = loanAmount * (loanTAE / 100);
  total += annualInterest;

  return total;
}

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
  const operatingCosts = calculateTotalCosts();
  const monthlyOperatingCost = operatingCosts / 12;
  const capitalizationNeeded = monthlyOperatingCost * 3;
  
  totalInvestment += capitalizationNeeded;
  
  return totalInvestment;
}

/* ===========================
   FINANCIACIÓN ESTRATEGIA - PANEL 5
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

  updateFinanceUI();
  updateAll();
};

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
  
  updateFinanceStatus();
}

function updateFinanceStatus() {
  const statusCard = document.getElementById('finance-status-card');
  const statusElement = document.getElementById('finance-status');
  const messageElement = document.getElementById('finance-message');

  if (!statusCard || !statusElement || !messageElement) return;

  // Resetear clases
  statusCard.className = 'result-card';
  
  const lang = localStorage.getItem('selectedLanguage') || 'eu';
  const strings = translations[lang];
  
  if (state.finance.financeDeficit === 0) {
    statusCard.classList.add('border-green-600', 'bg-green-50');
    statusElement.textContent = strings['finance.status.funded'];
    statusElement.className = "text-xl font-extrabold text-green-800 mt-1";
    messageElement.textContent = "Finantzaketa behar osoa estaltzen da";
  } else if (state.finance.financeDeficit <= state.finance.totalNeeded * 0.1) {
    statusCard.classList.add('border-yellow-600', 'bg-yellow-50');
    statusElement.textContent = strings['finance.status.almost'];
    statusElement.className = "text-xl font-extrabold text-yellow-800 mt-1";
    messageElement.textContent = "Defizit txikia, erraz konpon datieke";
  } else {
    statusCard.classList.add('border-red-600', 'bg-red-50');
    statusElement.textContent = strings['finance.status.deficit'];
    statusElement.className = "text-xl font-extrabold text-red-800 mt-1";
    messageElement.textContent = "Finantzaketa gehiago behar da";
  }
}

/* ===========================
   SISTEMA DE PESTAÑAS
   =========================== */
function initTabs() {
  const tabs = document.querySelectorAll('.tabs button');
  const panels = document.querySelectorAll('.panel');

  tabs.forEach((tab, idx) => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      panels.forEach(p => p.style.display = 'none');
      if (panels[idx]) panels[idx].style.display = 'block';
      updateRightSummary();
    });
  });

  // Mostrar primer panel
  if (tabs[0]) tabs[0].classList.add('active');
  panels.forEach((p, i) => p.style.display = i === 0 ? 'block' : 'none');
}

/* ===========================
   RENDER DE TABLAS COMPLETO
   =========================== */
function renderAllTables() {
  // Amortizables Lokala
  const renderAmort = (cat, tbodyId) => {
    const tb = document.getElementById(tbodyId);
    if (!tb) return;
    tb.innerHTML = '';
    state.amortizables[cat].forEach(it => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input value="${it.name}" data-id="${it.id}" data-field="name"></td>
        <td style="text-align:right"><input type="number" value="${it.cost}" data-id="${it.id}" data-field="cost"></td>
        <td style="text-align:center"><input type="number" value="${it.life}" data-id="${it.id}" data-field="life"></td>
        <td style="text-align:right">${fmt(it.cost / it.life)}</td>
        <td><button onclick="removeAmortizable('${it.id}','${cat}')" class="btn small">✕</button></td>`;
      tb.appendChild(tr);
    });
  };

  renderAmort('lokala', 'lokala-amortizable-body');
  renderAmort('garraioa', 'garraioa-amortizable-body');

  // Gastos Recurrentes
  const renderRec = (cat, tbodyId) => {
    const tb = document.getElementById(tbodyId);
    if (!tb) return;
    tb.innerHTML = '';
    state.recurrings[cat].forEach(it => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input value="${it.name}" data-id="${it.id}" data-field="name"></td>
        <td style="text-align:right"><input type="number" value="${it.payment_cost}" data-id="${it.id}" data-field="payment_cost"></td>
        <td style="text-align:center"><input type="number" value="${it.frequency}" data-id="${it.id}" data-field="frequency"></td>
        <td style="text-align:right">${fmt(it.payment_cost * it.frequency)}</td>
        <td><button onclick="removeRecurring('${it.id}','${cat}')" class="btn small">✕</button></td>`;
      tb.appendChild(tr);
    });
  };

  renderRec('lokala', 'lokala-recurring-body');
  renderRec('ekoizpena', 'ekoizpena-recurring-body');
  renderRec('garraioa', 'garraioa-recurring-body');
  renderRec('hazkuntza', 'hazkuntza-recurring-body');

  // Personal
  const tbP = document.getElementById('personnel-body');
  if (tbP) {
    tbP.innerHTML = '';
    state.personnel.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input value="${p.role}" data-id="${p.id}" data-field="role"></td>
        <td style="text-align:right"><input type="number" value="${p.gross}" data-id="${p.id}" data-field="gross"></td>
        <td style="text-align:center"><input type="number" value="${p.employer_ss}" data-id="${p.id}" data-field="employer_ss"></td>
        <td style="text-align:right">${fmt(p.gross * (1 + p.employer_ss / 100))}</td>
        <td><button onclick="removePersonnel('${p.id}')" class="btn small">✕</button></td>`;
      tbP.appendChild(tr);
    });
  }

  // Añadir event listeners a los inputs
  qsa('input[data-id]').forEach(input => {
    input.addEventListener('input', onFieldChange);
  });
}

/* ===========================
   CRUD OPERATIONS
   =========================== */
window.addAmortizable = function (cat) {
  state.amortizables[cat].push({
    id: uid('am'),
    name: 'Ekipamendua',
    cost: 1000,
    life: 5,
    category: cat
  });
  renderAllTables();
  updateAll();
};

window.removeAmortizable = function (id, cat) {
  state.amortizables[cat] = state.amortizables[cat].filter(x => x.id !== id);
  renderAllTables();
  updateAll();
};

window.addRecurring = function (cat) {
  state.recurrings[cat].push({
    id: uid('r'),
    name: 'Gastu',
    payment_cost: 100,
    frequency: 12,
    category: cat
  });
  renderAllTables();
  updateAll();
};

window.removeRecurring = function (id, cat) {
  state.recurrings[cat] = state.recurrings[cat].filter(x => x.id !== id);
  renderAllTables();
  updateAll();
};

window.addPerson = function () {
  state.personnel.push({
    id: uid('p'),
    role: 'Diseinatzaile',
    gross: 25000,
    employer_ss: 30
  });
  renderAllTables();
  updateAll();
};

window.removePersonnel = function (id) {
  state.personnel = state.personnel.filter(p => p.id !== id);
  renderAllTables();
  updateAll();
};

window.onFieldChange = function (e) {
  const el = e.target;
  const id = el.dataset.id;
  const field = el.dataset.field;
  const value = el.type === 'number' ? safeNum(el.value) : el.value;

  // Buscar en amortizables
  ['lokala', 'garraioa'].forEach(cat => {
    const item = state.amortizables[cat].find(x => x.id === id);
    if (item) item[field] = value;
  });

  // Buscar en recurrentes
  ['lokala', 'ekoizpena', 'garraioa', 'hazkuntza'].forEach(cat => {
    const item = state.recurrings[cat].find(x => x.id === id);
    if (item) item[field] = value;
  });

  // Buscar en personal
  const person = state.personnel.find(x => x.id === id);
  if (person) person[field] = value;

  updateAll();
};

/* ===========================
   FINANCIACIÓN - PANEL 6 COMPLETO
   =========================== */
let socioCount = 3;
let capitalistaCount = 0;

function initFinantzaketaPanel() {
  updateNumSocios(socioCount);

  document.getElementById('add-socio')?.addEventListener('click', addSocio);
  document.getElementById('remove-socio')?.addEventListener('click', removeSocio);
  document.getElementById('add-capitalista')?.addEventListener('click', addCapitalista);

  // Añadir event listeners a inputs existentes
  ['necesidades-inversion', 'porcentaje-tesoreria', 'tae', 'plazo'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', calcularFinanciacion);
    }
  });

  calcularFinanciacion();
}

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
      <td><input type="number" value="0" min="0" class="capital-input"></td>
    `;
    tbody.appendChild(row);
  }

  // Añadir event listeners
  tbody.querySelectorAll('.capital-input').forEach(input => {
    input.addEventListener('input', calcularFinanciacion);
  });

  calcularFinanciacion();
}

function addSocio() {
  updateNumSocios(socioCount + 1);
}

function removeSocio() {
  if (socioCount > 1) {
    updateNumSocios(socioCount - 1);
  }
}

function addCapitalista() {
  capitalistaCount++;
  const tbody = document.getElementById('capitalistas-table-body');
  if (!tbody) return;

  const row = document.createElement('tr');
  row.innerHTML = `
    <td>Kapitalista Bazkidea ${capitalistaCount}</td>
    <td><input type="number" value="0" min="0" class="capitalista-input"></td>
    <td><button class="btn small" onclick="removeCapitalista(this)">Ezabatu</button></td>
  `;
  tbody.appendChild(row);

  // Añadir event listener
  row.querySelector('.capitalista-input').addEventListener('input', calcularFinanciacion);
  calcularFinanciacion();
}

function removeCapitalista(button) {
  const row = button.closest('tr');
  if (row) {
    row.remove();
    capitalistaCount--;
    calcularFinanciacion();
  }
}

function calcularFinanciacion() {
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

  // Calcular tesorería
  const porcentajeTesoreria = parseFloat(document.getElementById('porcentaje-tesoreria')?.value) || 0;
  const gastosAnualesTotales = calculateTotalCosts();
  const importeTesoreria = gastosAnualesTotales * (porcentajeTesoreria / 100);

  // Calcular necesidades TOTALES
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

  // Actualizar interfaz
  const setText = (id, value, isCurrency = true) => {
    const el = document.getElementById(id);
    if (el) el.textContent = isCurrency ? fmt(value) : value;
  };

  setText('total-socios', totalSocios);
  setText('total-capitalistas', totalCapitalistas);
  setText('cantidad-financiar', cantidadFinanciar);
  setText('cuota-mensual', cuotaMensual);
  setText('interes-anual', interesAnual);
  setText('cuota-anual', cuotaAnual);
  setText('importe-tesoreria', importeTesoreria);
  setText('importe-tesoreria-display', importeTesoreria);

  updateAll();
}

/* ===========================
   PRICING - PANEL 7 COMPLETO
   =========================== */
function calculatePricing(totalOperational = null) {
  if (totalOperational === null) {
    totalOperational = calculateTotalCosts();
  }

  const margin = safeNum(qs('#target-profit-margin')?.value) || 20;
  const corporateTax = safeNum(qs('#corporate-tax')?.value) || 25;
  const emp = Math.max(1, safeNum(qs('#employee-count')?.value) || 1);
  const hours = safeNum(qs('#annual-hours-per-employee')?.value) || 1600;
  const totalHours = emp * hours;

  // Obtener costes financieros del Panel 6
  const cuotaAnualEl = document.getElementById('cuota-anual');
  const costosFinancieros = cuotaAnualEl ?
    safeNum(cuotaAnualEl.textContent.replace(/[^\d.,]/g, '').replace(',', '.')) || 0 : 0;

  // Cálculos de pricing
  const costesTotales = totalOperational + costosFinancieros;
  const margenBruto = costesTotales * (margin / 100);
  const revenue = costesTotales + margenBruto;
  const suggested = totalHours > 0 ? revenue / totalHours : 0;

  // Margen neto
  const beneficioAntesImpuestos = margenBruto;
  const impuestos = Math.max(0, beneficioAntesImpuestos * (corporateTax / 100));
  const margenNeto = beneficioAntesImpuestos - impuestos;

  // Actualizar interfaz
  const setText = (id, value, isCurrency = true) => {
    const el = document.getElementById(id);
    if (el) el.textContent = isCurrency ? fmt(value) : value;
  };

  setText('total-available-hours', totalHours);
  setText('suggested-hourly-rate', suggested);
  setText('expected-net-profit', margenNeto);
  setText('required-annual-revenue', revenue);

  // Actualizar desglose pedagógico si existe
  actualizarDesglosePedagogico(totalOperational, costosFinancieros, costesTotales, margenBruto, revenue, totalHours, suggested, margin);

  // Guardar valores para sidebar
  try {
    const suggestedEl = document.getElementById('suggested-hourly-rate');
    const requiredRevenueEl = document.getElementById('required-annual-revenue');
    const totalHoursEl = document.getElementById('total-available-hours');
    const margenBrutoEl = document.getElementById('margen-bruto-panel7');

    if (suggestedEl) suggestedEl.dataset.value = suggested;
    if (requiredRevenueEl) requiredRevenueEl.dataset.value = revenue;
    if (totalHoursEl) totalHoursEl.dataset.value = totalHours;
    if (margenBrutoEl) margenBrutoEl.dataset.value = margenBruto;
  } catch (error) {
    console.warn("Error guardando valores:", error);
  }

  return revenue;
}

function actualizarDesglosePedagogico(operacional, financieros, totales, margenBruto, facturacion, horas, precioHora, porcentajeMargen) {
  const setFmt = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = fmt(value);
  };

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  // Solo actualizar si los elementos existen
  setFmt('desglose-gastos-operativos', operacional);
  setFmt('desglose-costes-financieros', financieros);
  setFmt('desglose-gastos-totales', totales);
  setFmt('desglose-margen-bruto', margenBruto);
  setFmt('desglose-facturacion-total', facturacion);
  setFmt('desglose-precio-hora', precioHora);
  
  setText('desglose-porcentaje-margen', porcentajeMargen + '%');
  setText('desglose-total-horas', horas.toLocaleString());
}

/* ===========================
   SIDEBAR SUMMARY COMPLETO
   =========================== */
function updateRightSummary(totalOperational = null) {
  if (totalOperational === null) {
    totalOperational = calculateTotalCosts();
  }

  // Obtener costes financieros
  const cuotaAnualEl = document.getElementById('cuota-anual');
  const costosFinancieros = cuotaAnualEl ?
    safeNum(cuotaAnualEl.textContent.replace(/[^\d.,]/g, '').replace(',', '.')) || 0 : 0;

  // Obtener valores de pricing
  let suggestedRate = 0;
  let requiredRevenue = 0;
  let totalHours = 0;
  let margenBruto = 0;

  try {
    suggestedRate = safeNum(document.getElementById('suggested-hourly-rate')?.dataset.value) || 0;
    requiredRevenue = safeNum(document.getElementById('required-annual-revenue')?.dataset.value) || 0;
    totalHours = safeNum(document.getElementById('total-available-hours')?.dataset.value) || 0;
    margenBruto = safeNum(document.getElementById('margen-bruto-panel7')?.dataset.value) || 0;
  } catch (error) {
    console.warn("Error obteniendo datos de pricing:", error);
  }

  // Si no hay margen bruto, calcularlo
  if (margenBruto === 0) {
    const margin = safeNum(document.getElementById('target-profit-margin')?.value) || 20;
    margenBruto = (totalOperational + costosFinancieros) * (margin / 100);
  }

  // Employee count
  const employeeCount = state.personnel.length;

  // Calcular desglose de costes
  const desgloseCostes = calcularDesgloseCostes();

  // Actualizar sidebar
  const setText = (id, value, isCurrency = true) => {
    const el = document.getElementById(id);
    if (el) el.textContent = isCurrency ? fmt(value) : value;
  };

  // Card 1: Facturación Principal
  setText('total-facturacion', requiredRevenue);
  setText('gastos-operativos', totalOperational);
  setText('costos-financieros', costosFinancieros);
  setText('margen-bruto', margenBruto);

  // Card 2: Precio/Hora
  setText('suggested-hourly-rate-sidebar', suggestedRate);
  setText('employee-count-sidebar', employeeCount, false);
  setText('annual-hours-sidebar', totalHours.toLocaleString(), false);

  // Card 3: Desglose de Costes
  setText('total-amortizaciones', desgloseCostes.amortizaciones);
  setText('total-gastos-fijos', desgloseCostes.gastosFijos);
  setText('total-personal', desgloseCostes.personal);
  setText('total-intereses', costosFinancieros);
}

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

  // Gastos fijos
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

/* ===========================
   ACTUALIZACIÓN GENERAL MEJORADA
   =========================== */
function updateAll() {
  // 1. Actualizar estrategia de financiación (Panel 5)
  updateFinanceStrategy();
  
  // 2. Recalcular financiación detallada (Panel 6)
  calcularFinanciacion();
  
  // 3. Recalcular pricing con todos los costes (Panel 7)
  const totalOperational = calculateTotalCosts();
  calculatePricing(totalOperational);
  
  // 4. Actualizar sidebar
  updateRightSummary(totalOperational);
}

// Función de cascada para actualizaciones complejas
function actualizarCascada() {
  console.log("🔄 Ejecutando actualización en cascada...");
  
  setTimeout(() => {
    try {
      updateAll();
      console.log("✅ Cascada completada");
    } catch (error) {
      console.error("❌ Error en cascada:", error);
    }
  }, 100);
}

/* ===========================
   DATOS DE EJEMPLO COMPLETOS
   =========================== */
function preloadSampleData() {
  // Amortizables Lokala
  state.amortizables.lokala = [
    { id: uid('am'), name: 'Lokalaren Erosketa (Amortizagarria)', cost: 120000, life: 20, category: 'lokala' },
    { id: uid('am'), name: 'Erreformaren Balioa (Amortizagarria)', cost: 30000, life: 10, category: 'lokala' },
    { id: uid('am'), name: 'Altzarien Erosketa', cost: 8000, life: 5, category: 'lokala' },
    { id: uid('am'), name: 'Hardware eta Softwarearen Hornitzea', cost: 4000, life: 4, category: 'lokala' }
  ];

  // Amortizables Garraioa
  state.amortizables.garraioa = [
    { id: uid('am'), name: 'Garraio Ibilgailuaren Erosketa', cost: 20000, life: 5, category: 'garraioa' }
  ];

  // Gastos Recurrentes Lokala
  state.recurrings.lokala = [
    { id: uid('r'), name: 'Alokairua (Hilekoa)', payment_cost: 800, frequency: 12, category: 'lokala' },
    { id: uid('r'), name: 'Hornigaiak: Gutxieneko Kontsumoa (Argia, Ura)', payment_cost: 100, frequency: 12, category: 'lokala' },
    { id: uid('r'), name: 'Erantzukizun Zibileko Asegurua (Urteko Prima FINKOA)', payment_cost: 600, frequency: 1, category: 'lokala' },
    { id: uid('r'), name: 'Zergak eta Udal Tasak (Lokala)', payment_cost: 1200, frequency: 1, category: 'lokala' },
    { id: uid('r'), name: 'Bestelako Aseguruak (Lokala)', payment_cost: 450, frequency: 1, category: 'lokala' },
    { id: uid('r'), name: 'Telefonia eta Internet FINKOA', payment_cost: 80, frequency: 12, category: 'lokala' }
  ];

  // Gastos Recurrentes Ekoizpena
  state.recurrings.ekoizpena = [
    { id: uid('r'), name: 'EZA (Proiektu Bakoltzeko Gehigarria)', payment_cost: 200, frequency: 12, category: 'ekoizpena' },
    { id: uid('r'), name: 'Hirugarrenen Lan Laguntzaileak (Proiektuko Azpikontratak)', payment_cost: 1500, frequency: 12, category: 'ekoizpena' },
    { id: uid('r'), name: 'Material Gordinak / Kontsumigarri Espezifikoak', payment_cost: 400, frequency: 12, category: 'ekoizpena' },
    { id: uid('r'), name: 'Elkargo Tasak (Jarduerari lotuak)', payment_cost: 150, frequency: 1, category: 'ekoizpena' }
  ];

  // Gastos Recurrentes Garraioa
  state.recurrings.garraioa = [
    { id: uid('r'), name: 'Garraioa: Mantentze-lanak eta Konponketak', payment_cost: 500, frequency: 1, category: 'garraioa' },
    { id: uid('r'), name: 'Garraioa: Udal Tasak eta Zergak (Urteko)', payment_cost: 150, frequency: 1, category: 'garraioa' },
    { id: uid('r'), name: 'Garraioa: Asegurua (Urteko)', payment_cost: 500, frequency: 1, category: 'garraioa' },
    { id: uid('r'), name: 'Garraioa: Erregaia / Gasolina', payment_cost: 250, frequency: 12, category: 'garraioa' },
    { id: uid('r'), name: 'Dietak / Bazkariak (Desplazamenduak)', payment_cost: 150, frequency: 12, category: 'garraioa' }
  ];

  // Gastos Recurrentes Hazkuntza
  state.recurrings.hazkuntza = [
    { id: uid('r'), name: 'Prestakuntza Saioak eta Ikastaroak', payment_cost: 800, frequency: 1, category: 'hazkuntza' },
    { id: uid('r'), name: 'Aldizkari eta Ikerketa Harpidetzak', payment_cost: 100, frequency: 12, category: 'hazkuntza' },
    { id: uid('r'), name: 'Komunikazioa Sareetan / Marketing digitala', payment_cost: 300, frequency: 12, category: 'hazkuntza' },
    { id: uid('r'), name: 'Patrozinioak / Networking Ekitaldiak', payment_cost: 500, frequency: 1, category: 'hazkuntza' }
  ];

  // Personal
  state.personnel = [
    { id: uid('p'), role: 'Zuzendaria / Bazkidea', gross: 35000, employer_ss: 30 }
  ];

  renderAllTables();
}

/* ===========================
   EVENT LISTENERS GLOBALES COMPLETOS
   =========================== */
function bindGlobalInputs() {
  // Selector de idioma
  const languageSelect = document.getElementById('language-select');
  if (languageSelect) {
    languageSelect.addEventListener('change', e => {
      applyTranslations(e.target.value);
    });
  }

  // Botón PDF
  const downloadBtn = document.getElementById('download-report-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', generatePDFReport);
  }

  // Inputs de préstamo (Panel 5)
  ['loan-amount', 'loan-tae', 'loan-term'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateLoanCalculation);
    }
  });

  // Inputs de capital socios (Panel 5)
  ['partner-capital-1', 'partner-capital-2', 'partner-capital-3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateFinanceStrategy);
    }
  });

  // Inputs de pricing (Panel 7)
  ['corporate-tax', 'target-profit-margin', 'employee-count', 'annual-hours-per-employee'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', actualizarCascada);
    }
  });

  // Inputs de financiación (Panel 6) - ya configurados en initFinantzaketaPanel
}

/* ===========================
   GENERACIÓN PDF COMPLETA
   =========================== */
async function generatePDFReport() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.style.display = 'flex';

  try {
    const node = document.querySelector('.panel:not([style*="display: none"])') || document.body;
    const canvas = await html2canvas(node, { 
      scale: 2, 
      useCORS: true, 
      backgroundColor: '#fff',
      logging: false
    });
    
    const img = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'pt', 'a4');
    const w = doc.internal.pageSize.getWidth();
    const h = canvas.height * w / canvas.width;
    
    doc.addImage(img, 'PNG', 0, 0, w, h);

    const lang = localStorage.getItem('selectedLanguage') || 'eu';
    const footer = translations[lang]?.['footer.note'] || translations.eu['footer.note'];
    doc.setFontSize(9);
    doc.text(footer, 40, doc.internal.pageSize.getHeight() - 30);

    doc.save('IDarte_Aurrekontua.pdf');
  } catch (e) {
    console.error('Error generando PDF:', e);
    alert('Errorea sortzean PDF: ' + e.message);
  }

  if (overlay) overlay.style.display = 'none';
}

/* ===========================
   INICIALIZACIÓN COMPLETA
   =========================== */
async function init() {
  console.log("🚀 Iniciando aplicación IDarte...");
  
  // 1. Cargar idioma
  const lang = localStorage.getItem('selectedLanguage') || 'eu';
  applyTranslations(lang);

  // 2. Cargar datos de ejemplo
  preloadSampleData();
  
  // 3. Inicializar componentes
  initTabs();
  bindGlobalInputs();
  initFinantzaketaPanel();

  // 4. Cálculos iniciales
  setTimeout(() => {
    console.log("🔧 Ejecutando cálculos iniciales...");
    updateAll();
  }, 800);

  // 5. Configurar selector de idioma
  const sel = document.getElementById('language-select');
  if (sel) sel.value = lang;

  console.log("✅ Aplicación inicializada correctamente");
}

// Iniciar cuando se cargue la página
window.addEventListener('load', init);

/* ===========================
   FUNCIONES DE DEBUG
   =========================== */
function debugState() {
  console.log("=== 🔍 DEBUG STATE ===");
  console.log("Amortizables Lokala:", state.amortizables.lokala);
  console.log("Personal:", state.personnel);
  console.log("Finance:", state.finance);
  console.log("Total Costs:", calculateTotalCosts());
  console.log("====================");
}

// Ejecutar debug después de init
setTimeout(debugState, 2000);
