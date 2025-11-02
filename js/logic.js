/* =========================================
// IDarte · VERSIÓN CORREGIDA
// ========================================= */

console.log("🚀 IDarte - Sistema con internacionalización JSON iniciado");

// ===== SISTEMA DE INTERNACIONALIZACIÓN CON JSON =====
let currentLanguage = 'eu';
let translations = {};

// Cargar traducciones desde el JSON
async function loadTranslations() {
    try {
        const response = await fetch('lang/lang.json');
        translations = await response.json();
        console.log("✅ Traducciones cargadas correctamente");
        applyTranslations();
    } catch (error) {
        console.error("❌ Error cargando traducciones:", error);
        // Cargar traducciones por defecto en caso de error
        translations = {
            "eu": {
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
                "footer.note": "IDarte · Euskadiko Diseinu Eskola Publikoa — Escuela Pública de Diseño de Euskadi.",
                "loading": "Txostena prestatzen..."
            },
            "es": {
                "header.title": "IDarte · Escuela Pública de Diseño de Euskadi",
                "header.subtitle": "GRADO EN DISEÑO DE INTERIORES - Mediciones y Presupuestos",
                "button.download": "Descargar",
                "tab.lokal": "1 · Local",
                "tab.pertsonala": "2 · Personal",
                "tab.ekoizpena": "3 · Producción",
                "tab.garraioa": "4 · Transporte",
                "tab.hazkuntza": "5 · Crecimiento",
                "tab.finantzaketa": "6 · Financiación",
                "tab.prezioa": "7 · Precio",
                "footer.note": "IDarte · Escuela Pública de Diseño de Euskadi — Euskadiko Diseinu Eskola Publikoa.",
                "loading": "Preparando el informe..."
            }
        };
        applyTranslations();
    }
}

function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        applyTranslations();
    }
}

function getTranslation(key) {
    return translations[currentLanguage]?.[key] || key;
}

function applyTranslations() {
    // Traducir elementos con data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getTranslation(key);
        if (translation && element.textContent !== translation) {
            element.textContent = translation;
        }
    });
    
    // Traducir textos estáticos que no tienen data-i18n
    updateStaticTexts();
}

function updateStaticTexts() {
    // Actualizar títulos de paneles
    const panelTitles = {
        'lokala-sheet': 'panel.lokal.title',
        'pertsonala-sheet': 'panel.pertsonala.title', 
        'ekoizpena-sheet': 'panel.ekoizpena.title',
        'garraioa-sheet': 'panel.garraioa.title',
        'hazkuntza-sheet': 'panel.hazkuntza.title',
        'finantzaketa-sheet': 'panel.finantzaketa.title',
        'prezioa-sheet': 'panel.prezioa.title'
    };
    
    Object.entries(panelTitles).forEach(([panelId, translationKey]) => {
        const title = document.querySelector(`#${panelId} h2`);
        if (title) title.textContent = getTranslation(translationKey);
    });

    // Actualizar subtítulos y secciones dentro de paneles
    updatePanelSections();
    
    // Actualizar textos de botones
    updateButtons();
    
    // Actualizar textos de formularios
    updateFormLabels();
    
    // Actualizar textos de tablas
    updateTableHeaders();
    
    // Actualizar sidebar
    updateSidebar();
    
    // Actualizar textos de ayuda
    updateHelpTexts();
}

function updatePanelSections() {
    // Panel 1 - Lokala
    const lokalaAmort = document.querySelector('#lokala-sheet h3:nth-child(2)');
    if (lokalaAmort) lokalaAmort.textContent = getTranslation('panel.lokal.amortizables');
    
    const lokalaGastos = document.querySelector('#lokala-sheet h3:nth-child(4)');
    if (lokalaGastos) lokalaGastos.textContent = getTranslation('panel.lokal.gastos');

    // Panel 4 - Garraioa
    const garraioaAmort = document.querySelector('#garraioa-sheet h3:nth-child(2)');
    if (garraioaAmort) garraioaAmort.textContent = getTranslation('panel.garraioa.amortizables');
    
    const garraioaGastos = document.querySelector('#garraioa-sheet h3:nth-child(4)');
    if (garraioaGastos) garraioaGastos.textContent = getTranslation('panel.garraioa.gastos');

    // Panel 6 - Finantzaketa
    const financeSections = document.querySelectorAll('#finantzaketa-sheet h3');
    if (financeSections.length >= 1) {
        financeSections[0].textContent = getTranslation('finance.inversiones');
    }
    if (financeSections.length >= 2) {
        financeSections[1].textContent = getTranslation('finance.bazkideEkarpenak');
    }
    if (financeSections.length >= 3) {
        financeSections[2].textContent = getTranslation('finance.kanpokoFinantzaketa');
    }

    // Panel 7 - Prezioa
    const pricingTitle = document.querySelector('#prezioa-sheet h4');
    if (pricingTitle) pricingTitle.textContent = getTranslation('pricing.nolaKalkulatzen');
}

function updateButtons() {
    const buttons = document.querySelectorAll('.btn.small');
    buttons.forEach(btn => {
        const btnText = btn.textContent.trim();
        if (btnText.includes('+') || btnText === '+ Gehitu' || btnText === '+ Añadir' || btnText === '+ Add') {
            if (btn.onclick && btn.onclick.toString().includes('addAmortizable')) {
                btn.textContent = getTranslation('button.addAmortizable');
            } else if (btn.onclick && btn.onclick.toString().includes('addRecurring')) {
                btn.textContent = getTranslation('button.addRecurring');
            } else if (btn.onclick && btn.onclick.toString().includes('addPerson')) {
                btn.textContent = getTranslation('button.addPerson');
            } else if (btn.onclick && btn.onclick.toString().includes('addSocio')) {
                btn.textContent = getTranslation('button.addSocio');
            } else {
                btn.textContent = getTranslation('button.add');
            }
        }
        if (btnText.includes('-') || btnText === '- Kendu Bazkidea' || btnText === '- Quitar Socio' || btnText === '- Remove Partner') {
            btn.textContent = getTranslation('button.removeSocio');
        }
        if (btnText === '✕') {
            btn.textContent = getTranslation('button.remove');
        }
    });
}

function updateFormLabels() {
    // Actualizar labels de formularios
    const mesesTesoreriaLabel = document.querySelector('label[for="meses-tesoreria"]');
    if (mesesTesoreriaLabel) mesesTesoreriaLabel.textContent = getTranslation('form.mesesTesoreria');
    
    const mesesTesoreriaHelp = document.querySelector('#meses-tesoreria + small');
    if (mesesTesoreriaHelp) mesesTesoreriaHelp.textContent = getTranslation('form.mesesTesoreriaHelp');

    // Actualizar opciones del selector de tipos de socio
    document.querySelectorAll('select[data-field="tipo"] option').forEach(option => {
        if (option.value === 'trabajador') {
            option.textContent = getTranslation('socio.trabajador');
        } else if (option.value === 'capitalista') {
            option.textContent = getTranslation('socio.capitalista');
        }
    });

    // Actualizar opciones del selector de tipos de préstamo
    const loanOptions = document.querySelectorAll('#tipo-prestamo option');
    if (loanOptions.length >= 1) {
        loanOptions[0].textContent = getTranslation('form.maileguEstandarra');
    }
    if (loanOptions.length >= 2) {
        loanOptions[1].textContent = getTranslation('form.maileguHipotekario');
    }
}

function updateTableHeaders() {
    // Actualizar encabezados de tablas
    const tables = document.querySelectorAll('table.data thead th');
    tables.forEach(th => {
        const text = th.textContent.trim();
        if (text === 'Kontzeptua' || text === 'Concepto' || text === 'Concept') {
            th.textContent = getTranslation('table.concepto');
        } else if (text.includes('Kostua') || text.includes('Coste') || text.includes('Cost')) {
            th.textContent = getTranslation('table.coste');
        }
        // ... añadir más mapeos según necesites
    });
}

function updateSidebar() {
    // Actualizar textos del sidebar
    const sidebarTitles = document.querySelectorAll('.card h4');
    sidebarTitles.forEach(title => {
        const text = title.textContent.trim();
        if (text === 'Urteko Fakturazioa Beharrezkoa' || text === 'Facturación Anual Necesaria' || text === 'Required Annual Revenue') {
            title.textContent = getTranslation('sidebar.facturacion');
        }
        // ... añadir más mapeos
    });
}

function updateHelpTexts() {
    // Actualizar textos de ayuda
    const helpTexts = document.querySelectorAll('small');
    helpTexts.forEach(small => {
        const text = small.textContent.trim();
        if (text.includes('Normalean %10-%20') || text.includes('Normalmente 10%-20%') || text.includes('Normally 10%-20%')) {
            small.textContent = getTranslation('help.kutxaInfo');
        }
    });
}

// ===== CONFIGURACIÓN DEL SELECTOR DE IDIOMA =====
function setupLanguageSelector() {
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.addEventListener('change', function() {
            setLanguage(this.value);
        });
    }
}

const state = {
  amortizables: { lokala: [], garraioa: [] },
  recurrings: { lokala: [], ekoizpena: [], garraioa: [], hazkuntza: [] },
  personnel: [],
  finance: { 
    socios: [],
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

function updateElement(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// ===== DATOS PRECARGADOS =====
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

  // --- FINANZAS ---
  state.finance.socios = [
    { id: uid('s'), name: 'Bazkide 1', tipo: 'trabajador', aportacion: 0 },
    { id: uid('s'), name: 'Bazkide 2', tipo: 'trabajador', aportacion: 0 },
    { id: uid('s'), name: 'Bazkide 3', tipo: 'capitalista', aportacion: 0 }
  ];

  console.log("✅ Datos precargados correctamente");
}

// ===== CÁLCULOS FINANCIEROS =====
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
  const tesoreria = (gastosOperativosAnuales / 12) * mesesTesoreria;
  const necesidadesTotales = inversiones + tesoreria;

  return { inversiones, gastosOperativosAnuales, tesoreria, necesidadesTotales };
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

function calculatePricing() {
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

  console.log("📊 Datos para sidebar:", {
    employeeCount,
    annualHours, 
    totalHours,
    employeeCountElement: document.getElementById('employee-count-sidebar'),
    annualHoursElement: document.getElementById('annual-hours-sidebar')
  });

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
  updateElement('cuota-anual-display', fmt(financiacion.cuotaAnual));
  updateElement('total-socios-display', fmt(financiacion.aportacionesTotales));
  updateElement('num-socios', state.finance.socios.length);

  // ACTUALIZAR SIDEBAR - CORRECCIÓN APLICADA AQUÍ
  updateElement('total-facturacion', fmt(facturacionNecesaria));
  updateElement('gastos-operativos', fmt(costesOperativos));
  updateElement('costos-financieros', fmt(costesFinancieros));
  updateElement('margen-bruto', fmt(margenBruto));
  updateElement('suggested-hourly-rate-sidebar', fmt(precioHora));
  
  // CORRECCIÓN: Actualizar los elementos correctos del sidebar
  const employeeCountSidebar = document.getElementById('employee-count-sidebar');
  const annualHoursSidebar = document.getElementById('annual-hours-sidebar');
  
  if (employeeCountSidebar) {
    employeeCountSidebar.textContent = employeeCount;
  }
  if (annualHoursSidebar) {
    annualHoursSidebar.textContent = totalHours.toLocaleString();
  }

  // Resumen de costes
  const totalAmortizaciones = calculateTotalAmortizations();
  const totalGastosFijos = calculateTotalRecurring();
  const totalPersonal = calculateTotalPersonnel();
  
  updateElement('total-amortizaciones', fmt(totalAmortizaciones));
  updateElement('total-gastos-fijos', fmt(totalGastosFijos));
  updateElement('total-personal', fmt(totalPersonal));
  updateElement('total-intereses', fmt(financiacion.interesAnual));

  return { facturacionNecesaria, precioHora, margenBruto, beneficioNeto };
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

// ===== GESTIÓN DE SOCIOS =====
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

// ¡ESTA ES LA FUNCIÓN QUE FALTABA!
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

  if (found) updateAll();
};

// ===== RENDER DE TABLAS =====
function renderAllTables() {
  // Solo renderizar las tablas que existen
  renderTable(state.amortizables.lokala, 'lokala-amortizable-body', 'amort');
  renderTable(state.amortizables.garraioa, 'garraioa-amortizable-body', 'amort');
  
  renderTable(state.recurrings.lokala, 'lokala-recurring-body', 'recur');
  renderTable(state.recurrings.ekoizpena, 'ekoizpena-recurring-body', 'recur');
  renderTable(state.recurrings.garraioa, 'garraioa-recurring-body', 'recur');
  renderTable(state.recurrings.hazkuntza, 'hazkuntza-recurring-body', 'recur');
  
  renderTable(state.personnel, 'personnel-body', 'person');
  renderTable(state.finance.socios, 'socios-table-body', 'socio');
  
  // NO renderizar capitalistas-table-body porque ya no existe
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

// ===== ACTUALIZACIÓN GLOBAL =====
function updateAll() {
  calculatePricing();
}

// ===== INICIALIZACIÓN =====
// ===== INICIALIZACIÓN MEJORADA CON JSON =====
async function initializeApp() {
    console.log("🎯 Inicializando IDarte con internacionalización JSON...");
    
    // Primero cargar las traducciones
    await loadTranslations();
    
    // Luego el resto de la inicialización
    setupLanguageSelector();
    
    preloadSampleData();
    renderAllTables();
    setupTabNavigation();
    
    const globalInputs = [
        'target-profit-margin', 'corporate-tax', 'employee-count', 'annual-hours-per-employee',
        'tae', 'plazo', 'periodo-gracia', 'meses-tesoreria'
    ];
    
    globalInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updateAll);
    });
    
    setTimeout(updateAll, 100);
    console.log("✅ IDarte completamente operativo con internacionalización JSON");
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

window.addEventListener('load', initializeApp);
