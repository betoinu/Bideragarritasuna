/* =========================================
// IDarte · VERSIÓN COMPLETA Y REPARADA
// ========================================= */

console.log("🚀 IDarte - Sistema COMPLETO iniciado");

// ===== DECLARACIONES GLOBALES =====
window.state = {
  amortizables: { lokala: [], garraioa: [] },
  recurrings: { lokala: [], ekoizpena: [], garraioa: [], hazkuntza: [] },
  personnel: [],
  finance: { 
    socios: [],
    prestamo: { tae: 5, plazo: 5, periodoGracia: 0 }
  }
};

let currentLanguage = 'eu';
let translations = {};

// ===== FUNCIONES BASE (DEFINIDAS PRIMERO) =====
function uid(prefix = 'id') { 
    return prefix + '-' + Math.random().toString(36).slice(2, 9); 
}

function fmt(n) { 
    n = Number(n) || 0;
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n);
}

function safeNum(v) {
    if (v === '' || v === null || v === undefined) return 0;
    const cleaned = String(v).replace(/[^\d,.-]/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : Math.max(0, num);
}

function updateElement(id, value) {
  try {
    // Buscar TODOS los elementos con este ID (puede haber duplicados)
    const elementos = document.querySelectorAll(`#${id}`);
    
    if (elementos.length === 0) {
      console.warn(`⚠️ Elemento con ID "${id}" no encontrado en el DOM`);
      return false;
    }
    
    let actualizados = 0;
    elementos.forEach(el => {
      const stringValue = String(value);
      const currentValue = el.textContent.trim();
      const newValue = stringValue.trim();
      
      if (currentValue !== newValue) {
        if (el.tagName === 'INPUT' || el.tagName === 'SELECT') {
          el.value = value;
        } else {
          el.textContent = value;
        }
        actualizados++;
      }
    });
    
    if (actualizados > 0) {
      console.log(`✅ ${actualizados} elemento(s) ${id} actualizado(s) a: "${value}"`);
    } else {
      console.log(`⏭️ ${id} ya tiene el valor correcto: "${value}"`);
    }
    
    return actualizados > 0;
    
  } catch (error) {
    console.error(`💥 Error actualizando elemento ${id}:`, error);
    return false;
  }
}
// ===== SISTEMA DE INTERNACIONALIZACIÓN CORREGIDO =====
async function loadTranslations() {
    try {
        const response = await fetch('lang/lang.json');
        if (!response.ok) throw new Error('HTTP error ' + response.status);
        translations = await response.json();
        console.log("✅ Traducciones cargadas del JSON");
        applyTranslations();
    } catch (error) {
        console.error("❌ Error cargando lang.json:", error);
        // ELIMINA las traducciones hardcodeadas - deja que falle visiblemente
        translations = {};
        alert("Error cargando traducciones. Verifica que lang/lang.json existe.");
    }
}

function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        applyTranslations();
        updateAll(); // Para actualizar números/formateos
    }
}

function getTranslation(key) {
    // CORREGIDO - accede correctamente al idioma actual
    if (translations[currentLanguage] && translations[currentLanguage][key]) {
        return translations[currentLanguage][key];
    }
    console.warn(`⚠️ Traducción faltante: ${key} (${currentLanguage})`);
    return key; // Fallback a la clave
}

function applyTranslations() {
    console.log("🔤 Aplicando traducciones para:", currentLanguage);
    
    let elementosTraducidos = 0;
    
    // Traducir elementos con data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getTranslation(key);
        
        if (translation && element.textContent !== translation) {
            element.textContent = translation;
            elementosTraducidos++;
        }
    });
    
    // Traducir placeholders
    document.querySelectorAll('input[data-i18n-placeholder]').forEach(input => {
        const key = input.getAttribute('data-i18n-placeholder');
        input.placeholder = getTranslation(key);
    });
    
    // Traducir opciones de select
    document.querySelectorAll('option[data-i18n]').forEach(option => {
        const key = option.getAttribute('data-i18n');
        const translation = getTranslation(key);
        if (translation && option.textContent !== translation) {
            option.textContent = translation;
        }
    });
    
    console.log(`✅ ${elementosTraducidos} elementos traducidos`);
    
    // FORZAR retraducción del sidebar después de un delay
    setTimeout(() => {
        document.querySelectorAll('.sidebar [data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = getTranslation(key);
            if (translation) {
                element.textContent = translation;
            }
        });
        console.log("🔄 Sidebar retraducido");
    }, 100);
}

// ===== CONFIGURACIÓN DEL SELECTOR DE IDIOMA =====
function setupLanguageSelector() {
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        // Establecer el idioma actual basado en la selección
        languageSelect.value = currentLanguage;
        
        languageSelect.addEventListener('change', function() {
            setLanguage(this.value);
        });
        
        console.log("✅ Selector de idioma configurado");
    } else {
        console.warn("⚠️ Selector de idioma no encontrado");
    }
}

// ===== CÁLCULOS FINANCIEROS (DEFINIDOS ANTES DE USO) =====
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

function calculateOperationalCosts() {
    let total = 0;

    // Amortizaciones
    state.amortizables.lokala.forEach(item => {
        total += safeNum(item.cost) / Math.max(1, safeNum(item.life));
    });
    state.amortizables.garraioa.forEach(item => {
        total += safeNum(item.cost) / Math.max(1, safeNum(item.life));
    });

    // Gastos recurrentes
    Object.values(state.recurrings).forEach(category => {
        category.forEach(item => {
            total += safeNum(item.payment_cost) * Math.max(1, safeNum(item.frequency));
        });
    });

    // Personal
    state.personnel.forEach(person => {
        total += safeNum(person.gross) * (1 + safeNum(person.employer_ss) / 100);
    });

    return total;
}

function calculateInvestmentNeeds() {
    let inversiones = 0;
    
    state.amortizables.lokala.forEach(item => {
        inversiones += safeNum(item.cost);
    });
    state.amortizables.garraioa.forEach(item => {
        inversiones += safeNum(item.cost);
    });

    const gastosOperativosAnuales = calculateOperationalCosts();
    const mesesTesoreria = safeNum(document.getElementById('meses-tesoreria')?.value) || 3;
    const gastosMensuales = gastosOperativosAnuales / 12;
    const tesoreria = gastosMensuales * mesesTesoreria;
    const necesidadesTotales = inversiones + tesoreria;

    return { 
        inversiones, 
        gastosOperativosAnuales, 
        tesoreria, 
        necesidadesTotales 
    };
}

function calculateFinancing() {
    const necesidades = calculateInvestmentNeeds();
    
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
    const prestamoNecesario = Math.max(0, necesidades.necesidadesTotales - aportacionesTotales);

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
            interesAnual = (cuotaMensual * numPagos) - prestamoNecesario;
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

function calculatePricing() {
    console.log("🔍 INICIANDO calculatePricing()...");  
    
    // Control de reintentos
    if (!window.pricingRetryCount) window.pricingRetryCount = 0;
    
    const criticalElements = ['suggested-hourly-rate-sidebar', 'total-facturacion'];
    const missingCritical = criticalElements.filter(id => !document.getElementById(id));
    
    if (missingCritical.length > 0 && window.pricingRetryCount < 3) {
        window.pricingRetryCount++;
        console.log(`🔄 Reintento ${window.pricingRetryCount}/3 en 300ms`);
        setTimeout(calculatePricing, 300);
        return { facturacionNecesaria: 0, precioHora: 0, margenBruto: 0, beneficioNeto: 0 };
    }

    window.pricingRetryCount = 0;

    // CÁLCULOS PRINCIPALES
    const financiacion = calculateFinancing();
    const costesOperativos = financiacion.gastosOperativosAnuales;
    const costesFinancieros = financiacion.cuotaAnual;

    const margin = safeNum(document.getElementById('target-profit-margin')?.value) || 20;
    const corporateTax = safeNum(document.getElementById('corporate-tax')?.value) || 25;
    const employeeCount = Math.max(1, safeNum(document.getElementById('employee-count')?.value) || state.personnel.length);
    const annualHours = safeNum(document.getElementById('annual-hours-per-employee')?.value) || 1600;
    const totalHours = employeeCount * annualHours;

    const costesTotales = costesOperativos + costesFinancieros;
    const margenBruto = costesTotales * (margin / 100);
    const facturacionNecesaria = costesTotales + margenBruto;
    const precioHora = totalHours > 0 ? facturacionNecesaria / totalHours : 0;

    const impuestos = margenBruto * (corporateTax / 100);
    const beneficioNeto = margenBruto - impuestos;

    console.log("📈 Datos calculados:", {
        costesOperativos, costesFinancieros, facturacionNecesaria, precioHora
    });

    // ACTUALIZAR TODOS LOS ELEMENTOS (SIN DUPLICADOS)
    const updates = [
        // Panel 6 - Financiación
        { id: 'total-socios-display', value: fmt(financiacion.aportacionesTotales) },
        { id: 'cantidad-financiar', value: fmt(financiacion.prestamoNecesario) },
        { id: 'cuota-anual-display', value: fmt(financiacion.cuotaAnual) },
        { id: 'gastos-operativos-panel6', value: fmt(costesOperativos) },
        { id: 'costes-financieros-panel6', value: fmt(costesFinancieros) },
        { id: 'gastos-totales-panel6', value: fmt(costesTotales) }, // ✅ ESTA ES LA IMPORTANTE
        
        // Panel 7 - Pricing
        { id: 'desglose-gastos-operativos', value: fmt(costesOperativos) },
        { id: 'desglose-costes-financieros', value: fmt(costesFinancieros) },
        { id: 'desglose-gastos-totales', value: fmt(costesTotales) },
        { id: 'desglose-total-horas', value: totalHours.toLocaleString() },
        { id: 'desglose-porcentaje-margen', value: margin },
        { id: 'desglose-margen-bruto', value: fmt(margenBruto) },
        { id: 'desglose-facturacion-total', value: fmt(facturacionNecesaria) },
        { id: 'desglose-precio-hora', value: fmt(precioHora) },
        { id: 'suggested-hourly-rate', value: fmt(precioHora) },
        { id: 'margen-bruto-panel7', value: fmt(margenBruto) },
        { id: 'expected-net-profit', value: fmt(beneficioNeto) },
        { id: 'required-annual-revenue', value: fmt(facturacionNecesaria) },
      
        // Sidebar - VERSIÓN MEJORADA Y CORREGIDA
      { id: 'suggested-hourly-rate-sidebar', value: fmt(precioHora) },
      { id: 'employee-count-sidebar', value: employeeCount },
      { id: 'annual-hours-sidebar', value: totalHours.toLocaleString() },
      { id: 'total-facturacion', value: fmt(facturacionNecesaria) },
      { id: 'finantzaketa-total-calculada', value: fmt(financiacion.prestamoNecesario) },
      { id: 'inversion-total-sidebar', value: fmt(financiacion.inversiones) },
      { id: 'tesoreria-sidebar', value: fmt(financiacion.tesoreria) },
      { id: 'aportacion-total-sidebar', value: fmt(financiacion.aportacionesTotales) },
      { id: 'aportacion-trabajadores-sidebar', value: fmt(financiacion.aportacionesTrabajadores) },
      { id: 'aportacion-capitalistas-sidebar', value: fmt(financiacion.aportacionesCapitalistas) },
      { id: 'finantzaketa-neta-sidebar', value: fmt(financiacion.prestamoNecesario) },
      
      // NUEVOS IDs PARA EL CARD DE FACTURACIÓN CON AMORTIZACIONES
      { id: 'total-amortizaciones-sidebar', value: fmt(calculateTotalAmortizations()) },
      { id: 'total-gastos-fijos-sidebar', value: fmt(calculateTotalRecurring()) },
      { id: 'total-personal-sidebar', value: fmt(calculateTotalPersonnel()) },
      { id: 'costos-financieros-sidebar', value: fmt(costesFinancieros) },
      { id: 'margen-bruto-sidebar', value: fmt(margenBruto) },
        
              
              
        // Resumen financiero
        { id: 'total-inversion', value: fmt(financiacion.inversiones) },
        { id: 'tesoreria-calculada', value: fmt(financiacion.tesoreria) },
        { id: 'necesidad-total', value: fmt(financiacion.necesidadesTotales) },
        { id: 'total-aportacion-socios', value: fmt(financiacion.aportacionesTotales) },
        { id: 'total-trabajadores', value: fmt(financiacion.aportacionesTrabajadores) },
        { id: 'total-capitalistas', value: fmt(financiacion.aportacionesCapitalistas) },
        { id: 'num-socios', value: state.finance.socios.length }
    ];

    let updatedCount = 0;
    updates.forEach(({ id, value }) => {
        if (updateElement(id, value)) updatedCount++;
    });
  
    console.log(`✅ calculatePricing() completado - ${updatedCount}/${updates.length} elementos`);
    
    return { facturacionNecesaria, precioHora, margenBruto, beneficioNeto };
}

function updateRightSummary() {
    calculatePricing(); // calculatePricing ya actualiza todo
}

// ===== DATOS PRECARGADOS =====
function preloadSampleData() {
    console.log("📥 Cargando datos de ejemplo...");
    
    // Amortizables
    state.amortizables.lokala = [
        { id: uid('am'), name: 'Lokalaren Erosketa (Amortizagarria)', cost: 120000, life: 20, category: 'lokala' },
        { id: uid('am'), name: 'Erreformaren Balioa (Amortizagarria)', cost: 30000, life: 10, category: 'lokala' },
        { id: uid('am'), name: 'Altzarien Erosketa', cost: 8000, life: 5, category: 'lokala' },
        { id: uid('am'), name: 'Hardware eta Softwarearen Hornitzea', cost: 4000, life: 4, category: 'lokala' }
    ];

    state.amortizables.garraioa = [
        { id: uid('am'), name: 'Garraio Ibilgailuaren Erosketa', cost: 20000, life: 5, category: 'garraioa' }
    ];

    // Gastos recurrentes
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

    // Personal
    state.personnel = [
        { id: uid('p'), role: 'Zuzendaria / Bazkidea', gross: 35000, employer_ss: 30 }
    ];

    // Socios
    state.finance.socios = [
        { id: uid('s'), name: 'Bazkide 1', tipo: 'trabajador', aportacion: 0 },
        { id: uid('s'), name: 'Bazkide 2', tipo: 'trabajador', aportacion: 0 },
        { id: uid('s'), name: 'Bazkide 3', tipo: 'capitalista', aportacion: 0 }
    ];

    console.log("✅ Datos precargados correctamente");
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
    const newNumber = state.finance.socios.length + 1;
    state.finance.socios.push({
        id: uid('s'),
        name: `Bazkide ${newNumber}`,
        tipo: 'trabajador',
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

window.onFieldChange = function(e) {
    const el = e.target;
    const id = el.dataset.id;
    const field = el.dataset.field;
    const value = el.type === 'number' ? safeNum(el.value) : el.value;

    let found = false;

    // Buscar en amortizables
    ['lokala', 'garraioa'].forEach(cat => {
        const item = state.amortizables[cat].find(x => x.id === id);
        if (item) { item[field] = value; found = true; }
    });

    // Buscar en recurrentes
    if (!found) {
        ['lokala', 'ekoizpena', 'garraioa', 'hazkuntza'].forEach(cat => {
            const item = state.recurrings[cat].find(x => x.id === id);
            if (item) { item[field] = value; found = true; }
        });
    }

    // Buscar en personal
    if (!found) {
        const person = state.personnel.find(x => x.id === id);
        if (person) { person[field] = value; found = true; }
    }

    // Buscar en socios
    if (!found) {
        const socio = state.finance.socios.find(x => x.id === id);
        if (socio) { socio[field] = value; found = true; }
    }

    if (found) updateAll();
};

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
                        <select data-id="${item.id}" data-field="tipo" style="padding: 4px 8px; border-radius: 4px; border: 1px solid #ddd;">
                            <option value="trabajador" ${item.tipo === 'trabajador' ? 'selected' : ''}>Langile Bazkidea</option>
                            <option value="capitalista" ${item.tipo === 'capitalista' ? 'selected' : ''}>Kapitalista Bazkidea</option>
                        </select>
                    </td>
                    <td><input type="number" value="${item.aportacion}" data-id="${item.id}" data-field="aportacion" style="text-align: right; padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px;"></td>
                    <td><button onclick="removeSocio('${item.id}')" class="btn small">✕</button></td>
                </tr>
            `;
        }
    }).join('');

    // Configurar event listeners
    container.querySelectorAll('input[data-id], select[data-id]').forEach(input => {
        input.addEventListener('input', onFieldChange);
        input.addEventListener('change', onFieldChange);
    });
}

// ===== NAVEGACIÓN =====
function setupTabNavigation() {
    const tabs = document.querySelectorAll('.tab');
    const panels = document.querySelectorAll('.panel');
    
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.style.display = 'none');
            
            tab.classList.add('active');
            if (panels[index]) {
                panels[index].style.display = 'block';
            }
        });
    });
}

// ===== UTILIDADES DE INICIALIZACIÓN =====
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        function checkElement() {
            const element = typeof selector === 'string' ? 
                document.querySelector(selector) : 
                document.getElementById(selector);
                
            if (element) {
                resolve(element);
            } else if (Date.now() - startTime >= timeout) {
                reject(new Error(`Timeout esperando por elemento: ${selector}`));
            } else {
                setTimeout(checkElement, 100);
            }
        }
        
        checkElement();
    });
}

async function waitForCriticalElements(elementIds, maxAttempts = 5, delay = 200) {
    let attempts = 0;
    let missingElements = [];
    
    while (attempts < maxAttempts) {
        missingElements = elementIds.filter(id => !document.getElementById(id));
        
        if (missingElements.length === 0) {
            return [];
        }
        
        attempts++;
        
        if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    return missingElements;
}

function setupGlobalEventListeners() {
    console.log("🔧 Configurando event listeners globales...");
    
    const globalInputs = [
        { id: 'target-profit-margin', event: 'input' },
        { id: 'corporate-tax', event: 'input' },
        { id: 'employee-count', event: 'input' },
        { id: 'annual-hours-per-employee', event: 'input' },
        { id: 'tae', event: 'input' },
        { id: 'plazo', event: 'input' },
        { id: 'periodo-gracia', event: 'input' },
        { id: 'meses-tesoreria', event: 'input' },
        { id: 'tipo-prestamo', event: 'change' }
    ];
    
    globalInputs.forEach(({ id, event }) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener(event, updateAll);
        }
    });
    
    // Event listeners para inputs dinámicos
    document.addEventListener('input', function(e) {
        if (e.target.matches('input[data-id], select[data-id]')) {
            onFieldChange(e);
        }
    });
    
    document.addEventListener('change', function(e) {
        if (e.target.matches('input[data-id], select[data-id]')) {
            onFieldChange(e);
        }
    });
}

// ===== ACTUALIZACIÓN GLOBAL =====
function updateAll() {
    if (window.updateTimeout) clearTimeout(window.updateTimeout);
    window.updateTimeout = setTimeout(() => {
        calculatePricing();
    }, 100);
}

// ===== INICIALIZACIÓN PRINCIPAL =====
async function initializeApp() {
    console.log("🚀 Inicializando IDarte COMPLETO...");
    
    try {
        // Esperar a que el DOM esté listo si es necesario
        if (document.readyState === 'loading') {
            await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
        }

        // Configuración básica
        await loadTranslations();
        setupLanguageSelector();
        setupTabNavigation();
        
        // Cargar datos
        preloadSampleData();
        renderAllTables();
        setupGlobalEventListeners();
     
        // Cálculos iniciales
        await new Promise(resolve => setTimeout(resolve, 300));
        updateAll();
        
        // Verificación final
        setTimeout(() => {
            console.log("🔍 Verificación final...");
            const hourlyRate = document.getElementById('suggested-hourly-rate-sidebar');
            if (hourlyRate && hourlyRate.textContent !== '€ 0.00') {
                console.log("🎉 IDarte COMPLETO operativo y mostrando datos");
            } else {
                console.log("🔄 Último reintento...");
                updateAll();
            }
        }, 1000);
        
    } catch (error) {
        console.error("💥 Error en inicialización:", error);
    }
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

// ===== INICIALIZACIÓN AUTOMÁTICA =====
console.log("🔧 Inicialización automática COMPLETA configurada");

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log("✅ DOMContentLoaded - Ejecutando inicialización COMPLETA");
        initializeApp();
    });
} else {
    console.log("✅ DOM ya listo - Ejecutando inicialización COMPLETA inmediatamente");
    initializeApp();
}
