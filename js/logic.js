/* =========================================
// IDarte · Business Plan Financial Engine
// VERSIÓN DEFINITIVA - by Senior FullStack + MBA
// ========================================= */

console.log("🚀 IDarte - Motor Financiero Iniciado");

/* ============
   GLOBAL STATE
   ============ */
const state = {
  // Paneles 1-4: Costes operativos
  amortizables: { 
    lokala: [],  // Inversiones local
    garraioa: [] // Inversiones transporte
  },
  recurrings: {
    lokala: [],     // Gastos fijos local
    ekoizpena: [],  // Gastos producción
    garraioa: [],   // Gastos transporte  
    hazkuntza: []   // Gastos crecimiento
  },
  personnel: [],    // Costes personal
  
  // Panel 6: Financiación
  finance: {
    socios: [],
    capitalistas: [],
    tesoreria: 0,
    prestamo: {
      cantidad: 0,
      tae: 5,
      plazo: 5,
      cuotaAnual: 0
    }
  }
};

/* =====================
   CORE BUSINESS ENGINE
   ===================== */
function uid() { return 'id-' + Math.random().toString(36).substr(2, 9); }

function fmt(n) {
  n = Number(n) || 0;
  return new Intl.NumberFormat('es-ES', { 
    style: 'currency', currency: 'EUR' 
  }).format(n);
}

function safeNum(v) {
  if (v === '' || v === null || v === undefined) return 0;
  const num = Number(String(v).replace(',', '.'));
  return isNaN(num) ? 0 : num;
}

/* ===========================
   MOTOR DE CÁLCULOS PRINCIPALES
   =========================== */

/**
 * CALCULA COSTES OPERATIVOS ANUALES (Paneles 1-5)
 * - Amortizaciones
 * - Gastos recurrentes  
 * - Personal
 */
function calculateOperationalCosts() {
  let total = 0;

  // 1. AMORTIZACIONES (inversiones convertidas a gasto anual)
  Object.values(state.amortizables).forEach(categoria => {
    categoria.forEach(inversion => {
      const amortizacionAnual = safeNum(inversion.cost) / Math.max(1, safeNum(inversion.life));
      total += amortizacionAnual;
    });
  });

  // 2. GASTOS RECURRENTES ANUALES
  Object.values(state.recurrings).forEach(categoria => {
    categoria.forEach(gasto => {
      const costoAnual = safeNum(gasto.payment_cost) * safeNum(gasto.frequency);
      total += costoAnual;
    });
  });

  // 3. COSTES DE PERSONAL (salario bruto + seguridad social empresa)
  state.personnel.forEach(empleado => {
    const costeTotalEmpleado = safeNum(empleado.gross) * (1 + safeNum(empleado.employer_ss) / 100);
    total += costeTotalEmpleado;
  });

  console.log("💰 Costes operativos anuales:", fmt(total));
  return total;
}

/**
 * CALCULA NECESIDADES DE FINANCIACIÓN (Panel 6)
 * - Inversiones iniciales
 * - Capital de trabajo (tesorería)
 * - Financiación necesaria
 */
function calculateFundingNeeds() {
  let necesidades = 0;

  // 1. INVERSIONES INICIALES (día 0)
  Object.values(state.amortizables).forEach(categoria => {
    categoria.forEach(inversion => {
      necesidades += safeNum(inversion.cost);
    });
  });

  // 2. CAPITAL DE TRABAJO (3 meses de gastos operativos)
  const gastosOperativosAnuales = calculateOperationalCosts();
  const tesoreriaNecesaria = (gastosOperativosAnuales / 12) * 3;
  necesidades += tesoreriaNecesaria;

  console.log("🏦 Necesidades totales de financiación:", fmt(necesidades));
  return necesidades;
}

/**
 * MOTOR DE FINANCIACIÓN (Panel 6)
 * Calcula estructura óptima de financiación
 */
function calculateFinancing() {
  const necesidadesTotales = calculateFundingNeeds();
  
  // 1. APORTACIONES DE SOCIOS
  let aportacionSocios = 0;
  state.finance.socios.forEach(socio => {
    aportacionSocios += safeNum(socio.aportacion);
  });

  // 2. APORTACIONES CAPITALISTAS
  let aportacionCapitalistas = 0;
  state.finance.capitalistas.forEach(capitalista => {
    aportacionCapitalistas += safeNum(capitalista.aportacion);
  });

  // 3. CALCULAR PRÉSTAMO NECESARIO
  const financiacionPropia = aportacionSocios + aportacionCapitalistas;
  const prestamoNecesario = Math.max(0, necesidadesTotales - financiacionPropia);

  // 4. CALCULAR COSTE FINANCIERO
  let cuotaAnual = 0;
  let interesAnual = 0;

  if (prestamoNecesario > 0 && state.finance.prestamo.tae > 0 && state.finance.prestamo.plazo > 0) {
    const tasaMensual = (state.finance.prestamo.tae / 100) / 12;
    const numPagos = state.finance.prestamo.plazo * 12;
    
    if (tasaMensual > 0) {
      const cuotaMensual = prestamoNecesario * tasaMensual * Math.pow(1 + tasaMensual, numPagos) / 
                          (Math.pow(1 + tasaMensual, numPagos) - 1);
      cuotaAnual = cuotaMensual * 12;
      interesAnual = (cuotaMensual * numPagos - prestamoNecesario) / state.finance.prestamo.plazo;
    }
  }

  state.finance.prestamo.cantidad = prestamoNecesario;
  state.finance.prestamo.cuotaAnual = cuotaAnual;

  // 5. ACTUALIZAR UI PANEL 6
  updateFinancePanel(necesidadesTotales, financiacionPropia, prestamoNecesario, cuotaAnual, interesAnual);

  return {
    necesidadesTotales,
    financiacionPropia, 
    prestamoNecesario,
    costeFinancieroAnual: cuotaAnual
  };
}

/**
 * MOTOR DE PRICING (Panel 7)
 * Calcula precio/hora considerando TODOS los costes
 */
function calculatePricing() {
  // 1. COSTES TOTALES = Operativos + Financieros
  const costesOperativos = calculateOperationalCosts();
  const costesFinancieros = state.finance.prestamo.cuotaAnual;
  const costesTotales = costesOperativos + costesFinancieros;

  // 2. PARÁMETROS DE PRICING
  const margenBrutoObjetivo = safeNum(document.getElementById('target-profit-margin')?.value) || 20;
  const impuestoSociedades = safeNum(document.getElementById('corporate-tax')?.value) || 25;
  const numEmpleados = Math.max(1, safeNum(document.getElementById('employee-count')?.value) || state.personnel.length);
  const horasProductivasPorEmpleado = safeNum(document.getElementById('annual-hours-per-employee')?.value) || 1600;
  const totalHorasProductivas = numEmpleados * horasProductivasPorEmpleado;

  // 3. CÁLCULOS DE PRICING
  const margenBruto = costesTotales * (margenBrutoObjetivo / 100);
  const facturacionNecesaria = costesTotales + margenBruto;
  const precioHora = totalHorasProductivas > 0 ? facturacionNecesaria / totalHorasProductivas : 0;

  // 4. MARGEN NETO (después de impuestos)
  const impuestos = margenBruto * (impuestoSociedades / 100);
  const margenNeto = margenBruto - impuestos;

  // 5. ACTUALIZAR UI PANEL 7
  updatePricingPanel(costesTotales, margenBruto, facturacionNecesaria, precioHora, margenNeto, totalHorasProductivas);

  console.log("🎯 Pricing calculado:", {
    costesOperativos: fmt(costesOperativos),
    costesFinancieros: fmt(costesFinancieros),
    costesTotales: fmt(costesTotales),
    margenBruto: fmt(margenBruto),
    facturacionNecesaria: fmt(facturacionNecesaria),
    precioHora: fmt(precioHora),
    horasProductivas: totalHorasProductivas
  });

  return facturacionNecesaria;
}

/* ===========================
   SISTEMA DE ACTUALIZACIÓN
   =========================== */

/**
 * ACTUALIZACIÓN MAESTRA - Orquesta todos los cálculos
 */
function updateAllCalculations() {
  console.log("🔄 Ejecutando actualización maestra...");
  
  try {
    // 1. Calcular financiación (Panel 6)
    const financiacion = calculateFinancing();
    
    // 2. Calcular pricing con financiación incluida (Panel 7)
    const facturacion = calculatePricing();
    
    // 3. Actualizar dashboard resumen
    updateSummaryDashboard(financiacion, facturacion);
    
    console.log("✅ Actualización maestra completada");
    
  } catch (error) {
    console.error("❌ Error en actualización maestra:", error);
  }
}

/* ===========================
   SISTEMA DE INTERFAZ
   =========================== */

/**
 * ACTUALIZA PANEL 6 - Financiación
 */
function updateFinancePanel(necesidades, propia, prestamo, cuotaAnual, interesAnual) {
  const elements = {
    'total-necesidades': necesidades,
    'financiacion-propia': propia,
    'prestamo-necesario': prestamo,
    'cuota-anual': cuotaAnual,
    'interes-anual': interesAnual
  };

  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = fmt(value);
  });
}

/**
 * ACTUALIZA PANEL 7 - Pricing
 */
function updatePricingPanel(costesTotales, margenBruto, facturacion, precioHora, margenNeto, horas) {
  const elements = {
    'total-costes': costesTotales,
    'margen-bruto': margenBruto,
    'facturacion-needed': facturacion,
    'precio-hora': precioHora,
    'margen-neto': margenNeto,
    'horas-productivas': horas
  };

  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      if (id === 'horas-productivas') {
        element.textContent = value.toLocaleString();
      } else {
        element.textContent = fmt(value);
      }
    }
  });
}

/**
 * ACTUALIZA DASHBOARD RESUMEN
 */
function updateSummaryDashboard(financiacion, facturacion) {
  const costesOperativos = calculateOperationalCosts();
  const costesFinancieros = state.finance.prestamo.cuotaAnual;
  
  const elements = {
    'resumen-facturacion': facturacion,
    'resumen-costes-operativos': costesOperativos,
    'resumen-costes-financieros': costesFinancieros,
    'resumen-margen-bruto': facturacion - costesOperativos - costesFinancieros,
    'resumen-precio-hora': document.getElementById('precio-hora')?.textContent || '€0'
  };

  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = fmt(value);
  });
}

/* ===========================
   SISTEMA DE DATOS - CRUD
   =========================== */

// GESTIÓN DE INVERSIONES (Amortizables)
window.addInvestment = function(categoria) {
  state.amortizables[categoria].push({
    id: uid(),
    name: 'Nueva Inversión',
    cost: 10000,
    life: 5,
    category: categoria
  });
  renderTables();
  updateAllCalculations();
};

window.removeInvestment = function(id, categoria) {
  state.amortizables[categoria] = state.amortizables[categoria].filter(item => item.id !== id);
  renderTables();
  updateAllCalculations();
};

// GESTIÓN DE GASTOS RECURRENTES
window.addExpense = function(categoria) {
  state.recurrings[categoria].push({
    id: uid(),
    name: 'Nuevo Gasto',
    payment_cost: 100,
    frequency: 12,
    category: categoria
  });
  renderTables();
  updateAllCalculations();
};

window.removeExpense = function(id, categoria) {
  state.recurrings[categoria] = state.recurrings[categoria].filter(item => item.id !== id);
  renderTables();
  updateAllCalculations();
};

// GESTIÓN DE PERSONAL
window.addEmployee = function() {
  state.personnel.push({
    id: uid(),
    role: 'Nuevo Empleado',
    gross: 30000,
    employer_ss: 30
  });
  renderTables();
  updateAllCalculations();
};

window.removeEmployee = function(id) {
  state.personnel = state.personnel.filter(emp => emp.id !== id);
  renderTables();
  updateAllCalculations();
};

// GESTIÓN DE FINANCIACIÓN
window.addSocio = function() {
  state.finance.socios.push({
    id: uid(),
    name: 'Nuevo Socio',
    aportacion: 0
  });
  renderFinanceTables();
  updateAllCalculations();
};

window.addCapitalista = function() {
  state.finance.capitalistas.push({
    id: uid(),
    name: 'Nuevo Capitalista', 
    aportacion: 0
  });
  renderFinanceTables();
  updateAllCalculations();
};

/* ===========================
   SISTEMA DE RENDER
   =========================== */

function renderTables() {
  renderTable(state.amortizables.lokala, 'inversiones-lokal-table', 'investment');
  renderTable(state.recurrings.lokala, 'gastos-lokal-table', 'expense');
  renderTable(state.personnel, 'personal-table', 'employee');
}

function renderFinanceTables() {
  renderTable(state.finance.socios, 'socios-table', 'investor');
  renderTable(state.finance.capitalistas, 'capitalistas-table', 'investor');
}

function renderTable(items, containerId, type) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = items.map(item => {
    if (type === 'investment') {
      return `
        <tr>
          <td><input value="${item.name}" data-id="${item.id}" data-field="name"></td>
          <td><input type="number" value="${item.cost}" data-id="${item.id}" data-field="cost"></td>
          <td><input type="number" value="${item.life}" data-id="${item.id}" data-field="life"></td>
          <td>${fmt(item.cost / Math.max(1, item.life))}</td>
          <td><button onclick="removeInvestment('${item.id}', '${item.category}')">✕</button></td>
        </tr>
      `;
    }
    // ... más templates para otros tipos
  }).join('');

  // Añadir event listeners
  container.querySelectorAll('input[data-id]').forEach(input => {
    input.addEventListener('input', handleFieldChange);
  });
}

function handleFieldChange(e) {
  const target = e.target;
  const id = target.dataset.id;
  const field = target.dataset.field;
  const value = target.type === 'number' ? safeNum(target.value) : target.value;

  // Buscar y actualizar en todos los arrays del state
  updateStateItem(id, field, value);
  updateAllCalculations();
}

function updateStateItem(id, field, value) {
  // Buscar en amortizables
  for (const [categoria, items] of Object.entries(state.amortizables)) {
    const item = items.find(x => x.id === id);
    if (item) { item[field] = value; return; }
  }
  
  // Buscar en recurrentes
  for (const [categoria, items] of Object.entries(state.recurrings)) {
    const item = items.find(x => x.id === id);
    if (item) { item[field] = value; return; }
  }
  
  // Buscar en personal
  const employee = state.personnel.find(x => x.id === id);
  if (employee) { employee[field] = value; return; }
  
  // Buscar en financiación
  const socio = state.finance.socios.find(x => x.id === id);
  if (socio) { socio[field] = value; return; }
  
  const capitalista = state.finance.capitalistas.find(x => x.id === id);
  if (capitalista) { capitalista[field] = value; return; }
}

/* ===========================
   CONFIGURACIÓN DEL SISTEMA
   =========================== */

function initializeEventListeners() {
  // Inputs de pricing
  ['target-profit-margin', 'corporate-tax', 'employee-count', 'annual-hours-per-employee'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateAllCalculations);
  });

  // Inputs de financiación
  ['prestamo-tae', 'prestamo-plazo'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', function() {
        state.finance.prestamo[this.id.replace('prestamo-', '')] = safeNum(this.value);
        updateAllCalculations();
      });
    }
  });
}

function loadSampleData() {
  // Datos de ejemplo realistas
  state.amortizables.lokala = [{
    id: uid(), name: 'Mobiliario Oficina', cost: 15000, life: 10, category: 'lokala'
  }];
  
  state.recurrings.lokala = [{
    id: uid(), name: 'Alquiler Mensual', payment_cost: 1200, frequency: 12, category: 'lokala'
  }];
  
  state.personnel = [{
    id: uid(), role: 'Diseñador Senior', gross: 35000, employer_ss: 30
  }];
  
  state.finance.socios = [{
    id: uid(), name: 'Socio Fundador', aportacion: 50000
  }];

  renderTables();
  renderFinanceTables();
}

/* ===========================
   INICIALIZACIÓN
   =========================== */

function initializeApp() {
  console.log("🎯 Inicializando Motor Financiero IDarte...");
  
  loadSampleData();
  initializeEventListeners();
  updateAllCalculations();
  
  console.log("✅ IDarte completamente operativo");
}

// Iniciar aplicación
window.addEventListener('load', initializeApp);
