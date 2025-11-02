/* =========================================
// IDarte · Motor Financiero Ultra-Simple
// ========================================= */

const state = {
  amortizables: { lokala: [], garraioa: [] },
  recurrings: { lokala: [], ekoizpena: [], garraioa: [], hazkuntza: [] },
  personnel: [],
  finance: { socios: [], capitalistas: [], prestamo: { tae: 5, plazo: 5 } }
};

// ===== UTILIDADES (20 líneas) =====
const fmt = n => new Intl.NumberFormat('es-ES', {style:'currency',currency:'EUR'}).format(n||0);
const safeNum = v => isNaN(v=Number(String(v||0).replace(',','.'))) ? 0 : v;
const uid = () => 'id-'+Math.random().toString(36).slice(2,9);

// ===== CÁLCULOS PRINCIPALES (30 líneas) =====
function calcularCostesOperativos() {
  let total = 0;
  Object.values(state.amortizables).flat().forEach(i => total += safeNum(i.cost)/Math.max(1,safeNum(i.life)));
  Object.values(state.recurrings).flat().forEach(c => c.forEach(g => total += safeNum(g.payment_cost)*safeNum(g.frequency)));
  state.personnel.forEach(p => total += safeNum(p.gross)*(1+safeNum(p.employer_ss)/100));
  return total;
}

function calcularFinanciacion() {
  const costesOp = calcularCostesOperativos();
  const inversiones = Object.values(state.amortizables).flat().reduce((sum,i) => sum+safeNum(i.cost), 0);
  const tesoreria = (costesOp/12)*3;
  const necesidades = inversiones + tesoreria;
  
  const aportaciones = [...state.finance.socios, ...state.finance.capitalistas].reduce((sum,a) => sum+safeNum(a.aportacion), 0);
  const prestamo = Math.max(0, necesidades - aportaciones);
  
  // Calcular cuota préstamo
  const tae = state.finance.prestamo.tae;
  const plazo = state.finance.prestamo.plazo;
  let cuotaAnual = 0;
  if (prestamo > 0 && tae > 0) {
    const mensual = (tae/100)/12;
    const pagos = plazo*12;
    cuotaAnual = (prestamo * mensual * Math.pow(1+mensual, pagos) / (Math.pow(1+mensual, pagos)-1)) * 12;
  }
  
  return { costesOp, necesidades, aportaciones, prestamo, cuotaAnual };
}

function calcularPricing() {
  const { costesOp, cuotaAnual } = calcularFinanciacion();
  const margin = safeNum(document.getElementById('target-profit-margin')?.value) || 20;
  const employees = Math.max(1, safeNum(document.getElementById('employee-count')?.value) || state.personnel.length);
  const hours = employees * (safeNum(document.getElementById('annual-hours-per-employee')?.value) || 1600);
  
  const costesTotales = costesOp + cuotaAnual;
  const facturacion = costesTotales * (1 + margin/100);
  const precioHora = hours > 0 ? facturacion / hours : 0;
  
  // Actualizar UI directamente
  document.getElementById('suggested-hourly-rate')?.textContent = fmt(precioHora);
  document.getElementById('required-annual-revenue')?.textContent = fmt(facturacion);
  document.getElementById('total-available-hours')?.textContent = hours.toLocaleString();
  
  return { costesOp, cuotaAnual, facturacion, precioHora };
}

// ===== CRUD SIMPLIFICADO (40 líneas) =====
window.addAmortizable = cat => { state.amortizables[cat].push({id:uid(),name:'Nuevo',cost:1000,life:5}); renderAll(); updateAll(); };
window.addRecurring = cat => { state.recurrings[cat].push({id:uid(),name:'Nuevo',payment_cost:100,frequency:12}); renderAll(); updateAll(); };
window.addPerson = () => { state.personnel.push({id:uid(),role:'Empleado',gross:30000,employer_ss:30}); renderAll(); updateAll(); };
window.addSocio = () => { state.finance.socios.push({id:uid(),name:'Socio',aportacion:0}); renderAll(); updateAll(); };
window.addCapitalista = () => { state.finance.capitalistas.push({id:uid(),name:'Capitalista',aportacion:0}); renderAll(); updateAll(); };

window.removeItem = (id, arrayName, subArray) => {
  if (subArray) state[arrayName][subArray] = state[arrayName][subArray].filter(x => x.id !== id);
  else state[arrayName] = state[arrayName].filter(x => x.id !== id);
  renderAll(); updateAll();
};

// ===== RENDER SIMPLIFICADO (30 líneas) =====
function renderAll() {
  renderTable(state.amortizables.lokala, 'lokala-amortizable-tbody', 'amort');
  renderTable(state.recurrings.lokala, 'lokala-recurring-tbody', 'recur');
  renderTable(state.personnel, 'personnel-tbody', 'person');
  renderTable(state.finance.socios, 'socios-tbody', 'socio');
  renderTable(state.finance.capitalistas, 'capitalistas-tbody', 'socio');
}

function renderTable(items, containerId, type) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = items.map(item => {
    const base = `<td><input value="${item.name}" data-id="${item.id}"></td>`;
    if (type === 'amort') return `<tr>${base}<td><input type="number" value="${item.cost}" data-id="${item.id}"></td><td><input type="number" value="${item.life}" data-id="${item.id}"></td><td>${fmt(item.cost/item.life)}</td><td><button onclick="removeItem('${item.id}', 'amortizables', 'lokala')">✕</button></td></tr>`;
    if (type === 'recur') return `<tr>${base}<td><input type="number" value="${item.payment_cost}" data-id="${item.id}"></td><td><input type="number" value="${item.frequency}" data-id="${item.id}"></td><td>${fmt(item.payment_cost*item.frequency)}</td><td><button onclick="removeItem('${item.id}', 'recurrings', 'lokala')">✕</button></td></tr>`;
    if (type === 'person') return `<tr>${base}<td><input type="number" value="${item.gross}" data-id="${item.id}"></td><td><input type="number" value="${item.employer_ss}" data-id="${item.id}"></td><td>${fmt(item.gross*(1+item.employer_ss/100))}</td><td><button onclick="removeItem('${item.id}', 'personnel')">✕</button></td></tr>`;
    if (type === 'socio') return `<tr>${base}<td><input type="number" value="${item.aportacion}" data-id="${item.id}"></td><td><button onclick="removeItem('${item.id}', 'finance', item.name.includes('Socio')?'socios':'capitalistas')">✕</button></td></tr>`;
  }).join('');

  container.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', e => {
      const item = findItem(e.target.dataset.id);
      if (item) item[e.target.previousElementSibling?.textContent ? 'name' : e.target.type === 'number' ? 'cost' : 'name'] = safeNum(e.target.value);
      updateAll();
    });
  });
}

function findItem(id) {
  return [...Object.values(state.amortizables).flat(), ...Object.values(state.recurrings).flat(), ...state.personnel, ...state.finance.socios, ...state.finance.capitalistas].find(x => x.id === id);
}

// ===== ACTUALIZACIÓN GLOBAL (10 líneas) =====
function updateAll() {
  const { costesOp, necesidades, aportaciones, prestamo, cuotaAnual } = calcularFinanciacion();
  const { facturacion, precioHora } = calcularPricing();
  
  // Actualizar Panel 6
  document.getElementById('total-necesidades')?.textContent = fmt(necesidades);
  document.getElementById('financiacion-propia')?.textContent = fmt(aportaciones);
  document.getElementById('prestamo-necesario')?.textContent = fmt(prestamo);
  document.getElementById('cuota-anual')?.textContent = fmt(cuotaAnual);
}

// ===== INICIALIZACIÓN (10 líneas) =====
function init() {
  // Datos de ejemplo
  state.amortizables.lokala.push({id:uid(), name:'Mobiliario', cost:15000, life:10});
  state.recurrings.lokala.push({id:uid(), name:'Alquiler', payment_cost:1200, frequency:12});
  state.personnel.push({id:uid(), role:'Diseñador', gross:35000, employer_ss:30});
  state.finance.socios.push({id:uid(), name:'Socio 1', aportacion:50000});
  
  // Event listeners
  ['target-profit-margin','employee-count','annual-hours-per-employee','prestamo-tae','prestamo-plazo'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateAll);
  });
  
  renderAll(); updateAll();
}

window.addEventListener('load', init);
