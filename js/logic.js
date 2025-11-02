/* =========================================
// IDarte · VERSIÓN DEFINITIVA CON DATOS PRECARGADOS COMPLETOS
// ========================================= */

console.log("🚀 IDarte - Sistema iniciado");

const state = {
  amortizables: { lokala: [], garraioa: [] },
  recurrings: { lokala: [], ekoizpena: [], garraioa: [], hazkuntza: [] },
  personnel: [],
  finance: { 
    socios: [],  // ← CAMBIADO: Ahora incluye tipo
    prestamo: { tae: 5, plazo: 5, periodoGracia: 0 }
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

// ===== DATOS PRECARGADOS COMPLETOS =====
function preloadSampleData() {
  console.log("📥 Cargando datos de ejemplo completos...");
  
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

  // --- FINANZAS ACTUALIZADAS ---
  state.finance.socios = [
    { id: uid('s'), name: 'Bazkide 1', tipo: 'trabajador', aportacion: 0 },
    { id: uid('s'), name: 'Bazkide 2', tipo: 'trabajador', aportacion: 0 },
    { id: uid('s'), name: 'Bazkide 3', tipo: 'capitalista', aportacion: 0 }
  ];

  console.log("✅ Datos precargados correctamente - Total elementos:", {
    amortizables: state.amortizables.lokala.length + state.amortizables.garraioa.length,
    recurrentes: Object.values(state.recurrings).flat().length,
    personal: state.personnel.length,
    socios: state.finance.socios.length
  });
}

// ===== CÁLCULOS FINANCIEROS MEJORADOS =====
function calculateInvestmentNeeds() {
  // 1. Inversiones en activos fijos
  let inversiones = 0;
  state.amortizables.lokala.forEach(item => {
    inversiones += safeNum(item.cost);
  });
  state.amortizables.garraioa.forEach(item => {
    inversiones += safeNum(item.cost);
  });

  // 2. Gastos operativos anuales (sin amortizaciones)
  const gastosOperativosAnuales = calculateOperationalCosts();
  
  // 3. Tesorería (n meses de gastos operativos)
  const mesesTesoreria = safeNum(document.getElementById('meses-tesoreria')?.value) || 3;
  const tesoreria = (gastosOperativosAnuales / 12) * mesesTesoreria;
  
  // 4. Necesidades totales de financiación
  const necesidadesTotales = inversiones + tesoreria;

  console.log("💰 Necesidades de inversión calculadas:", {
    inversiones: fmt(inversiones),
    gastosOperativos: fmt(gastosOperativosAnuales),
    tesoreria: fmt(tesoreria),
    necesidadesTotales: fmt(necesidadesTotales)
  });

  return {
    inversiones,
    gastosOperativosAnuales,
    tesoreria,
    necesidadesTotales
  };
}

function calculateFinancing() {
  const necesidades = calculateInvestmentNeeds();
  
  // 1. Calcular aportaciones diferenciadas por tipo
  let aportacionesTrabajadores = 0;
  let aportacionesCapitalistas = 0;
  
  state.finance.socios.forEach(socio => {
    if (socio.tipo === 'trabajador') {
      aportacionesTrabajadores += safeNum(socio.aportacion);
    } else {
      aportacionesCapitalistas += safeNum(socio.aportacion);
    }
  });
  
  const aportacionesTotales = aportacionesTrabajadores + aportacionesCapitalistas;
  
  // 2. Préstamo necesario
  const prestamoNecesario = Math.max(0, necesidades.necesidadesTotales - aportacionesTotales);

  // 3. Calcular cuota del préstamo (sistema francés)
  const tae = safeNum(document.getElementById('tae')?.value) || 5;
  const plazo = safeNum(document.getElementById('plazo')?.value) || 5;
  const periodoGracia = safeNum(document.getElementById('periodo-gracia')?.value) || 0;
  
  let cuotaAnual = 0;
  let interesAnual = 0;

  if (prestamoNecesario > 0 && tae > 0 && plazo > 0) {
    const tasaMensual = (tae / 100) / 12;
    const numPagos = (plazo * 12) - periodoGracia;
    
    if (numPagos > 0) {
      const cuotaMensual = prestamoNecesario * tasaMensual * Math.pow(1 + tasaMensual, numPagos) / 
                          (Math.pow(1 + tasaMensual, numPagos) - 1);
      cuotaAnual = cuotaMensual * 12;
      interesAnual = cuotaAnual * numPagos / 12 - prestamoNecesario / (plazo - periodoGracia/12);
    }
  }

  return {
    ...necesidades,
    aportacionesTrabajadores,
    aportacionesCapitalistas,
    aportacionesTotales,
    prestamoNecesario,
    cuotaAnual,
    interesAnual
  };
}

function calculateOperationalCosts() {
  let total = 0;

  // 1. Amortizaciones (¡IMPORTANTE! Incluir en costes operativos)
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

  // 3. Personal (coste total empleador)
  state.personnel.forEach(person => {
    total += safeNum(person.gross) * (1 + safeNum(person.employer_ss) / 100);
  });

  return total;
}

function calculatePricing() {
  const financiacion = calculateFinancing();
  const costesOperativos = financiacion.gastosOperativosAnuales;
  const costesFinancieros = financiacion.cuotaAnual;

  // Parámetros del negocio
  const margin = safeNum(document.getElementById('target-profit-margin')?.value) || 20;
  const corporateTax = safeNum(document.getElementById('corporate-tax')?.value) || 25;
  const employeeCount = Math.max(1, safeNum(document.getElementById('employee-count')?.value) || state.personnel.length);
  const annualHours = safeNum(document.getElementById('annual-hours-per-employee')?.value) || 1600;
  const totalHours = employeeCount * annualHours;

  // CÁLCULOS ECONÓMICOS CLAVE
  const costesTotales = costesOperativos + costesFinancieros;
  const margenBruto = costesTotales * (margin / 100);
  const facturacionNecesaria = costesTotales + margenBruto;
  const precioHora = totalHours > 0 ? facturacionNecesaria / totalHours : 0;

  // Cálculo de impuestos y beneficio neto
  const beneficioBruto = margenBruto;
  const impuestos = beneficioBruto * (corporateTax / 100);
  const beneficioNeto = beneficioBruto - impuestos;

  // ACTUALIZAR PANEL 7
  updateElement('desglose-gastos-operativos', fmt(costesOperativos));
  updateElement('desglose-costes-financieros', fmt(costesFinancieros));
  updateElement('desglose-gastos-totales', fmt(costesTotales));
  updateElement('desglose-porcentaje-margen', margin);
  updateElement('desglose-margen-bruto', fmt(margenBruto));
  updateElement('desglose-facturacion-total', fmt(facturacionNecesaria));
  updateElement('desglose-total-horas', totalHours.toLocaleString());
  updateElement('desglose-precio-hora', fmt(precioHora));
  
  updateElement('suggested-hourly-rate', fmt(precioHora));
  updateElement('margen-bruto-panel7', fmt(margenBruto));
  updateElement('expected-net-profit', fmt(beneficioNeto));
  updateElement('required-annual-revenue', fmt(facturacionNecesaria));

  // ACTUALIZAR PANEL 6
  updateElement('total-inversion', fmt(financiacion.inversiones));
  updateElement('tesoreria-calculada', fmt(financiacion.tesoreria));
  updateElement('necesidad-total', fmt(financiacion.necesidadesTotales));
  updateElement('total-aportacion-socios', fmt(financiacion.aportacionesTotales));
  updateElement('total-trabajadores', fmt(financiacion.aportacionesTrabajadores));
  updateElement('total-capitalistas', fmt(financiacion.aportacionesCapitalistas));
  updateElement('cantidad-financiar', fmt(financiacion.prestamoNecesario));
  updateElement('cuota-anual', fmt(financiacion.cuotaAnual));
  updateElement('gastos-operativos-panel6', fmt(costesOperativos));
  updateElement('costes-financieros-panel6', fmt(costesFinancieros));
  updateElement('gastos-totales-panel6', fmt(costesTotales));
  updateElement('num-socios', state.finance.socios.length);

  // ACTUALIZAR SIDEBAR
  updateElement('total-facturacion', fmt(facturacionNecesaria));
  updateElement('gastos-operativos', fmt(costesOperativos));
  updateElement('costos-financieros', fmt(costesFinancieros));
  updateElement('margen-bruto', fmt(margenBruto));
  updateElement('suggested-hourly-rate-sidebar', fmt(precioHora));
  updateElement('employee-count-sidebar', employeeCount);
  updateElement('annual-hours-sidebar', totalHours.toLocaleString());

  // Resumen de costes para sidebar
  const totalAmortizaciones = calculateTotalAmortizations();
  const totalGastosFijos = calculateTotalRecurring();
  const totalPersonal = calculateTotalPersonnel();
  
  updateElement('total-amortizaciones', fmt(totalAmortizaciones));
  updateElement('total-gastos-fijos', fmt(totalGastosFijos));
  updateElement('total-personal', fmt(totalPersonal));
  updateElement('total-intereses', fmt(financiacion.interesAnual));

  console.log("🎯 Modelo de negocio calculado:", {
    facturacionNecesaria: fmt(facturacionNecesaria),
    precioHora: fmt(precioHora),
    margenBruto: fmt(margenBruto),
    beneficioNeto: fmt(beneficioNeto),
    necesidadesFinanciacion: fmt(financiacion.necesidadesTotales)
  });

  return {
    facturacionNecesaria,
    precioHora,
    margenBruto,
    beneficioNeto
  };
}

// ===== FUNCIONES AUXILIARES =====
function calculateTotalAmortizations() {
  let total = 0;
  Object.values(state.amortizables).forEach(category => {
    category.forEach(item => {
      total += safeNum(item.cost) / Math.max(1, safeNum(item.life));
    });
  });
  return total;
}

function calculateTotalRecurring() {
  let total = 0;
  Object.values(state.recurrings).forEach(category => {
    category.forEach(item => {
      total += safeNum(item.payment_cost) * Math.max(1, safeNum(item.frequency));
    });
  });
  return total;
}

function calculateTotalPersonnel() {
  let total = 0;
  state.personnel.forEach(person => {
    total += safeNum(person.gross) * (1 + safeNum(person.employer_ss) / 100);
  });
  return total;
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

// ===== FUNCIONES DE GESTIÓN DE SOCIOS MEJORADAS =====
window.addSocio = function() {
  const newNumber = state.finance.socios.length + 1;
  state.finance.socios.push({
    id: uid('s'),
    name: `Bazkide ${newNumber}`,
    tipo: 'trabajador', // Por defecto es trabajador
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

window.removeLastSocio = function() {
  if (state.finance.socios.length > 1) {
    state.finance.socios.pop();
    renderAllTables();
    updateAll();
  }
};

// ELIMINAR las funciones antiguas de capitalistas:
// window.addCapitalista y window.removeCapitalista

// ===== RENDER DE TABLAS =====
function renderAllTables() {
  renderTable(state.amortizables.lokala, 'lokala-amortizable-body', 'amort');
  renderTable(state.amortizables.garraioa, 'garraioa-amortizable-body', 'amort');
  
  renderTable(state.recurrings.lokala, 'lokala-recurring-body', 'recur');
  renderTable(state.recurrings.ekoizpena, 'ekoizpena-recurring-body', 'recur');
  renderTable(state.recurrings.garraioa, 'garraioa-recurring-body', 'recur');
  renderTable(state.recurrings.hazkuntza, 'hazkuntza-recurring-body', 'recur');
  
  renderTable(state.personnel, 'personnel-body', 'person');
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
      const amortizacionAnual = safeNum(item.cost) / Math.max(1, safeNum(item.life));
      return `
        <tr>
          <td><input value="${item.name}" data-id="${item.id}" data-field="name"></td>
          <td class="text-right"><input type="number" value="${item.cost}" data-id="${item.id}" data-field="cost"></td>
          <td class="text-center"><input type="number" value="${item.life}" data-id="${item.id}" data-field="life"></td>
          <td class="text-right">${fmt(amortizacionAnual)}</td>
          <td><button onclick="removeAmortizable('${item.id}','${item.category}')" class="btn small">✕</button></td>
        </tr>
      `;
    }
    if (type === 'recur') {
      const totalAnual = safeNum(item.payment_cost) * Math.max(1, safeNum(item.frequency));
      return `
        <tr>
          <td><input value="${item.name}" data-id="${item.id}" data-field="name"></td>
          <td class="text-right"><input type="number" value="${item.payment_cost}" data-id="${item.id}" data-field="payment_cost"></td>
          <td class="text-center"><input type="number" value="${item.frequency}" data-id="${item.id}" data-field="frequency"></td>
          <td class="text-right">${fmt(totalAnual)}</td>
          <td><button onclick="removeRecurring('${item.id}','${item.category}')" class="btn small">✕</button></td>
        </tr>
      `;
    }
    if (type === 'person') {
      const costeTotal = safeNum(item.gross) * (1 + safeNum(item.employer_ss) / 100);
      return `
        <tr>
          <td><input value="${item.role}" data-id="${item.id}" data-field="role"></td>
          <td class="text-right"><input type="number" value="${item.gross}" data-id="${item.id}" data-field="gross"></td>
          <td class="text-center"><input type="number" value="${item.employer_ss}" data-id="${item.id}" data-field="employer_ss"></td>
          <td class="text-right">${fmt(costeTotal)}</td>
          <td><button onclick="removePersonnel('${item.id}')" class="btn small">✕</button></td>
        </tr>
      `;
    }
    if (type === 'socio') {
  return `
    <tr>
      <td><input value="${item.name}" data-id="${item.id}" data-field="name" style="border: none; background: transparent; padding: 4px;"></td>
      <td>
        <select data-id="${item.id}" data-field="tipo" onchange="onFieldChange(event)" style="padding: 4px 8px; border-radius: 4px; border: 1px solid #ddd;">
          <option value="trabajador" ${item.tipo === 'trabajador' ? 'selected' : ''}>Langile Bazkidea</option>
          <option value="capitalista" ${item.tipo === 'capitalista' ? 'selected' : ''}>Kapitalista Bazkidea</option>
        </select>
      </td>
      <td><input type="number" value="${item.aportacion}" data-id="${item.id}" data-field="aportacion" style="text-align: right; padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px;"></td>
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

// ===== NAVEGACIÓN ENTRE PESTAÑAS =====
function setupTabNavigation() {
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.panel');
  
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      // Remover clase active de todas las pestañas
      tabs.forEach(t => t.classList.remove('active'));
      // Ocultar todos los paneles
      panels.forEach(p => p.style.display = 'none');
      
      // Activar pestaña clickeada
      tab.classList.add('active');
      
      // Mostrar panel correspondiente
      if (panels[index]) {
        panels[index].style.display = 'block';
      }
    });
  });
}

// ===== INICIALIZACIÓN MEJORADA =====
function initializeApp() {
  console.log("🎯 Inicializando IDarte con cálculos financieros mejorados...");
  
  preloadSampleData();
  renderAllTables();
  setupTabNavigation();
  
  // Configurar event listeners para todos los inputs globales
  const globalInputs = [
    'target-profit-margin', 'corporate-tax', 'employee-count', 'annual-hours-per-employee',
    'tae', 'plazo', 'periodo-gracia', 'meses-tesoreria'
  ];
  
  globalInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateAll);
  });
  
  // Inicializar cálculos
  setTimeout(updateAll, 100);
  
  console.log("✅ IDarte completamente operativo con modelo financiero integrado");
}

// ===== GENERACIÓN DE PDF =====
window.generatePDFReport = function() {
  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) loadingOverlay.style.display = 'flex';
  
  setTimeout(() => {
    html2canvas(document.getElementById('main-sheet')).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save('IDarte-Aurrekontua.pdf');
      if (loadingOverlay) loadingOverlay.style.display = 'none';
    });
  }, 500);
};

// Iniciar aplicación cuando se carga la página
window.addEventListener('load', initializeApp);
