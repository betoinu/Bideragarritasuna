/* =========================================
// IDarte · VERSIÓN DEFINITIVA CON DATOS PRECARGADOS COMPLETOS
// ========================================= */

console.log("🚀 IDarte - Sistema iniciado");

const state = {
  amortizables: { lokala: [], garraioa: [] },
  recurrings: { lokala: [], ekoizpena: [], garraioa: [], hazkuntza: [] },
  personnel: [],
  finance: { 
    socios: [], 
    capitalistas: [], 
    prestamo: { tae: 5, plazo: 5 }
  }
};

// ===== UTILIDADES =====
function uid(prefix = 'id') { return prefix + '-' + Math.random().toString(36).slice(2, 9); }
function fmt(n) { 
  n = Number(n) || 0;
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n);
}
function safeNum(v) {
  if (v === '' || v === null || v === undefined) return 0;
  const num = Number(String(v).replace(',', '.'));
  return isNaN(num) ? 0 : num;
}

// ===== DATOS PRECARGADOS COMPLETOS (IGUAL QUE TU VERSIÓN ORIGINAL) =====
function preloadSampleData() {
  console.log("📥 Cargando datos de ejemplo completos...");
  
  // --- AMORTIZABLES --- (EXACTAMENTE IGUAL QUE ANTES)
  state.amortizables.lokala = [
    { id: uid('am'), name: 'Lokalaren Erosketa (Amortizagarria)', cost: 120000, life: 20, category: 'lokala' },
    { id: uid('am'), name: 'Erreformaren Balioa (Amortizagarria)', cost: 30000, life: 10, category: 'lokala' },
    { id: uid('am'), name: 'Altzarien Erosketa', cost: 8000, life: 5, category: 'lokala' },
    { id: uid('am'), name: 'Hardware eta Softwarearen Hornitzea', cost: 4000, life: 4, category: 'lokala' }
  ];

  state.amortizables.garraioa = [
    { id: uid('am'), name: 'Garraio Ibilgailuaren Erosketa', cost: 20000, life: 5, category: 'garraioa' }
  ];

  // --- GASTOS RECURRENTES --- (EXACTAMENTE IGUAL QUE ANTES)
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

  // --- PERSONAL --- (EXACTAMENTE IGUAL QUE ANTES)
  state.personnel = [
    { id: uid('p'), role: 'Zuzendaria / Bazkidea', gross: 35000, employer_ss: 30 }
  ];

  // --- FINANZAS ---
  state.finance.socios = [
    { id: uid('s'), name: 'Bazkide 1', aportacion: 0 },
    { id: uid('s'), name: 'Bazkide 2', aportacion: 0 },
    { id: uid('s'), name: 'Bazkide 3', aportacion: 0 }
  ];

  console.log("✅ Datos precargados correctamente - Total elementos:", {
    amortizables: state.amortizables.lokala.length + state.amortizables.garraioa.length,
    recurrentes: Object.values(state.recurrings).flat().length,
    personal: state.personnel.length,
    socios: state.finance.socios.length
  });
}

// ===== CÁLCULOS FINANCIEROS =====
function calculateOperationalCosts() {
  let total = 0;

  // 1. Amortizaciones
  state.amortizables.lokala.forEach(item => {
    total += safeNum(item.cost) / Math.max(1, safeNum(item.life));
  });
  state.amortizables.garraioa.forEach(item => {
    total += safeNum(item.cost) / Math.max(1, safeNum(item.life));
  });

  // 2. Gastos recurrentes
  Object.values(state.recurrings).forEach(category => {
    category.forEach(item => {
      total += safeNum(item.payment_cost) * Math.max(1, safeNum(item.frequency));
    });
  });

  // 3. Personal
  state.personnel.forEach(person => {
    total += safeNum(person.gross) * (1 + safeNum(person.employer_ss) / 100);
  });

  console.log("💰 Costes operativos anuales calculados:", fmt(total));
  return total;
}

function calculateFinancing() {
  // 1. Inversiones iniciales
  let inversiones = 0;
  state.amortizables.lokala.forEach(item => {
    inversiones += safeNum(item.cost);
  });
  state.amortizables.garraioa.forEach(item => {
    inversiones += safeNum(item.cost);
  });

  // 2. Tesorería (3 meses de gastos operativos)
  const costesOperativos = calculateOperationalCosts();
  const tesoreria = (costesOperativos / 12) * 3;
  
  // 3. Necesidades totales
  const necesidadesTotales = inversiones + tesoreria;

  // 4. Aportaciones de socios
  let aportacionesSocios = 0;
  state.finance.socios.forEach(socio => {
    aportacionesSocios += safeNum(socio.aportacion);
  });
  
  // 5. Aportaciones capitalistas
  let aportacionesCapitalistas = 0;
  state.finance.capitalistas.forEach(cap => {
    aportacionesCapitalistas += safeNum(cap.aportacion);
  });
  
  const financiacionPropia = aportacionesSocios + aportacionesCapitalistas;

  // 6. Préstamo necesario
  const prestamoNecesario = Math.max(0, necesidadesTotales - financiacionPropia);

  // 7. Calcular cuota del préstamo
  const tae = state.finance.prestamo.tae;
  const plazo = state.finance.prestamo.plazo;
  let cuotaAnual = 0;

  if (prestamoNecesario > 0 && tae > 0 && plazo > 0) {
    const tasaMensual = (tae / 100) / 12;
    const numPagos = plazo * 12;
    const cuotaMensual = prestamoNecesario * tasaMensual * Math.pow(1 + tasaMensual, numPagos) / 
                        (Math.pow(1 + tasaMensual, numPagos) - 1);
    cuotaAnual = cuotaMensual * 12;
  }

  console.log("🏦 Financiación calculada:", {
    inversiones: fmt(inversiones),
    tesoreria: fmt(tesoreria),
    necesidades: fmt(necesidadesTotales),
    financiacionPropia: fmt(financiacionPropia),
    prestamo: fmt(prestamoNecesario),
    cuotaAnual: fmt(cuotaAnual)
  });

  return {
    costesOperativos,
    inversiones,
    tesoreria,
    necesidadesTotales,
    financiacionPropia,
    prestamoNecesario,
    cuotaAnual
  };
}

function calculatePricing() {
  const financiacion = calculateFinancing();
  const costesOperativos = financiacion.costesOperativos;
  const costesFinancieros = financiacion.cuotaAnual;

  // Parámetros con valores por defecto
  const margin = safeNum(document.getElementById('target-profit-margin')?.value) || 20;
  const corporateTax = safeNum(document.getElementById('corporate-tax')?.value) || 25;
  const employeeCount = Math.max(1, safeNum(document.getElementById('employee-count')?.value) || state.personnel.length);
  const annualHours = safeNum(document.getElementById('annual-hours-per-employee')?.value) || 1600;
  const totalHours = employeeCount * annualHours;

  // Cálculos de pricing
  const costesTotales = costesOperativos + costesFinancieros;
  const margenBruto = costesTotales * (margin / 100);
  const revenue = costesTotales + margenBruto;
  const hourlyRate = totalHours > 0 ? revenue / totalHours : 0;

  // Margen neto después de impuestos
  const taxAmount = margenBruto * (corporateTax / 100);
  const netProfit = margenBruto - taxAmount;

  // Actualizar UI Panel 7
  updateElement('total-available-hours', totalHours.toLocaleString());
  updateElement('suggested-hourly-rate', fmt(hourlyRate));
  updateElement('expected-net-profit', fmt(netProfit));
  updateElement('required-annual-revenue', fmt(revenue));

  // Actualizar Panel 6
  updateElement('total-necesidades', fmt(financiacion.necesidadesTotales));
  updateElement('financiacion-propia', fmt(financiacion.financiacionPropia));
  updateElement('prestamo-necesario', fmt(financiacion.prestamoNecesario));
  updateElement('cuota-anual', fmt(financiacion.cuotaAnual));
  updateElement('importe-tesoreria', fmt(financiacion.tesoreria));

  // Actualizar Sidebar
  updateElement('total-facturacion', fmt(revenue));
  updateElement('gastos-operativos', fmt(costesOperativos));
  updateElement('costos-financieros', fmt(costesFinancieros));
  updateElement('margen-bruto', fmt(margenBruto));
  updateElement('suggested-hourly-rate-sidebar', fmt(hourlyRate));
  updateElement('employee-count-sidebar', employeeCount);
  updateElement('annual-hours-sidebar', totalHours.toLocaleString());

  console.log("🎯 Pricing calculado:", {
    costesOperativos: fmt(costesOperativos),
    costesFinancieros: fmt(costesFinancieros),
    costesTotales: fmt(costesTotales),
    margenBruto: fmt(margenBruto),
    facturacion: fmt(revenue),
    precioHora: fmt(hourlyRate)
  });

  return revenue;
}

function updateElement(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// ===== CRUD OPERATIONS =====
window.addAmortizable = function(cat) {
  state.amortizables[cat].push({
    id: uid('am'),
    name: 'Elemento Nuevo',
    cost: 1000,
    life: 5,
    category: cat
  });
  renderAllTables();
  updateAll();
};

window.removeAmortizable = function(id, cat) {
  state.amortizables[cat] = state.amortizables[cat].filter(x => x.id !== id);
  renderAllTables();
  updateAll();
};

window.addRecurring = function(cat) {
  state.recurrings[cat].push({
    id: uid('r'),
    name: 'Gasto Nuevo',
    payment_cost: 100,
    frequency: 12,
    category: cat
  });
  renderAllTables();
  updateAll();
};

window.removeRecurring = function(id, cat) {
  state.recurrings[cat] = state.recurrings[cat].filter(x => x.id !== id);
  renderAllTables();
  updateAll();
};

window.addPerson = function() {
  state.personnel.push({
    id: uid('p'),
    role: 'Nuevo Empleado',
    gross: 30000,
    employer_ss: 30
  });
  renderAllTables();
  updateAll();
};

window.removePersonnel = function(id) {
  state.personnel = state.personnel.filter(p => p.id !== id);
  renderAllTables();
  updateAll();
};

window.addSocio = function() {
  state.finance.socios.push({
    id: uid('s'),
    name: 'Nuevo Socio',
    aportacion: 0
  });
  renderAllTables();
  updateAll();
};

window.removeSocio = function(id) {
  state.finance.socios = state.finance.socios.filter(s => s.id !== id);
  renderAllTables();
  updateAll();
};

window.addCapitalista = function() {
  state.finance.capitalistas.push({
    id: uid('c'),
    name: 'Nuevo Capitalista',
    aportacion: 0
  });
  renderAllTables();
  updateAll();
};

window.removeCapitalista = function(id) {
  state.finance.capitalistas = state.finance.capitalistas.filter(c => c.id !== id);
  renderAllTables();
  updateAll();
};

window.onFieldChange = function(e) {
  const el = e.target;
  const id = el.dataset.id;
  const field = el.dataset.field;
  const value = el.type === 'number' ? safeNum(el.value) : el.value;

  // Buscar en todos los arrays
  let found = false;

  // Amortizables
  ['lokala', 'garraioa'].forEach(cat => {
    const item = state.amortizables[cat].find(x => x.id === id);
    if (item) { item[field] = value; found = true; }
  });

  // Recurrentes
  if (!found) {
    ['lokala', 'ekoizpena', 'garraioa', 'hazkuntza'].forEach(cat => {
      const item = state.recurrings[cat].find(x => x.id === id);
      if (item) { item[field] = value; found = true; }
    });
  }

  // Personal
  if (!found) {
    const person = state.personnel.find(x => x.id === id);
    if (person) { person[field] = value; found = true; }
  }

  // Socios
  if (!found) {
    const socio = state.finance.socios.find(x => x.id === id);
    if (socio) { socio[field] = value; found = true; }
  }

  // Capitalistas
  if (!found) {
    const capitalista = state.finance.capitalistas.find(x => x.id === id);
    if (capitalista) { capitalista[field] = value; found = true; }
  }

  if (found) updateAll();
};

// ===== RENDER DE TABLAS =====
function renderAllTables() {
  renderTable(state.amortizables.lokala, 'lokala-amortizable-tbody', 'amort');
  renderTable(state.amortizables.garraioa, 'garraioa-amortizable-tbody', 'amort');
  
  renderTable(state.recurrings.lokala, 'lokala-recurring-tbody', 'recur');
  renderTable(state.recurrings.ekoizpena, 'ekoizpena-recurring-tbody', 'recur');
  renderTable(state.recurrings.garraioa, 'garraioa-recurring-tbody', 'recur');
  renderTable(state.recurrings.hazkuntza, 'hazkuntza-recurring-tbody', 'recur');
  
  renderTable(state.personnel, 'personnel-tbody', 'person');
  renderTable(state.finance.socios, 'socios-table-body', 'socio');
  renderTable(state.finance.capitalistas, 'capitalistas-table-body', 'capitalista');
}

function renderTable(items, containerId, type) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn("Contenedor no encontrado:", containerId);
    return;
  }

  container.innerHTML = items.map(item => {
    if (type === 'amort') {
      return `
        <tr>
          <td><input value="${item.name}" data-id="${item.id}" data-field="name"></td>
          <td class="text-right"><input type="number" value="${item.cost}" data-id="${item.id}" data-field="cost"></td>
          <td class="text-center"><input type="number" value="${item.life}" data-id="${item.id}" data-field="life"></td>
          <td class="text-right">${fmt(item.cost / Math.max(1, item.life))}</td>
          <td><button onclick="removeAmortizable('${item.id}','${item.category}')" class="btn small">✕</button></td>
        </tr>
      `;
    }
    if (type === 'recur') {
      return `
        <tr>
          <td><input value="${item.name}" data-id="${item.id}" data-field="name"></td>
          <td class="text-right"><input type="number" value="${item.payment_cost}" data-id="${item.id}" data-field="payment_cost"></td>
          <td class="text-center"><input type="number" value="${item.frequency}" data-id="${item.id}" data-field="frequency"></td>
          <td class="text-right">${fmt(item.payment_cost * item.frequency)}</td>
          <td><button onclick="removeRecurring('${item.id}','${item.category}')" class="btn small">✕</button></td>
        </tr>
      `;
    }
    if (type === 'person') {
      return `
        <tr>
          <td><input value="${item.role}" data-id="${item.id}" data-field="role"></td>
          <td class="text-right"><input type="number" value="${item.gross}" data-id="${item.id}" data-field="gross"></td>
          <td class="text-center"><input type="number" value="${item.employer_ss}" data-id="${item.id}" data-field="employer_ss"></td>
          <td class="text-right">${fmt(item.gross * (1 + item.employer_ss / 100))}</td>
          <td><button onclick="removePersonnel('${item.id}')" class="btn small">✕</button></td>
        </tr>
      `;
    }
    if (type === 'socio') {
      return `
        <tr>
          <td>${item.name}</td>
          <td><input type="number" value="${item.aportacion}" data-id="${item.id}" data-field="aportacion"></td>
          <td><button onclick="removeSocio('${item.id}')" class="btn small">✕</button></td>
        </tr>
      `;
    }
    if (type === 'capitalista') {
      return `
        <tr>
          <td>${item.name}</td>
          <td><input type="number" value="${item.aportacion}" data-id="${item.id}" data-field="aportacion"></td>
          <td><button onclick="removeCapitalista('${item.id}')" class="btn small">✕</button></td>
        </tr>
      `;
    }
  }).join('');

  // Añadir event listeners
  container.querySelectorAll('input[data-id]').forEach(input => {
    input.addEventListener('input', onFieldChange);
  });
}

// ===== ACTUALIZACIÓN GLOBAL =====
function updateAll() {
  calculatePricing();
}

// ===== INICIALIZACIÓN =====
function initializeApp() {
  console.log("🎯 Inicializando IDarte con datos precargados...");
  
  // 1. Cargar datos precargados (TODOS los elementos de tu versión original)
  preloadSampleData();
  
  // 2. Renderizar todas las tablas
  renderAllTables();
  
  // 3. Configurar event listeners globales
  const globalInputs = [
    'target-profit-margin', 'corporate-tax', 'employee-count', 'annual-hours-per-employee',
    'prestamo-tae', 'prestamo-plazo', 'porcentaje-tesoreria'
  ];
  
  globalInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateAll);
  });
  
  // 4. Actualizar préstamo en state cuando cambien los inputs
  document.getElementById('prestamo-tae')?.addEventListener('input', function() {
    state.finance.prestamo.tae = safeNum(this.value);
    updateAll();
  });
  
  document.getElementById('prestamo-plazo')?.addEventListener('input', function() {
    state.finance.prestamo.plazo = safeNum(this.value);
    updateAll();
  });
  
  // 5. Ejecutar cálculos iniciales
  setTimeout(updateAll, 100);
  
  console.log("✅ IDarte completamente operativo con todos los datos precargados");
}

// Iniciar aplicación
window.addEventListener('load', initializeApp);
