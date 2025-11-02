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

window.state = {
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
  // Eliminar espacios y caracteres no numéricos excepto punto y coma
  const cleaned = String(v).replace(/[^\d,.-]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.max(0, num); // Evitar números negativos
}

function updateElement(id, value) {
  try {
    const el = document.getElementById(id);
    if (el) {
      // Verificar el tipo de elemento y actualizar correctamente
      if (el.tagName === 'INPUT' || el.tagName === 'SELECT') {
        el.value = value;
      } else {
        el.textContent = value;
      }
      return true; // Éxito
    } else {
      console.warn(`⚠️ Elemento con ID "${id}" no encontrado en el DOM`);
      return false; // Falla
    }
  } catch (error) {
    console.error(`💥 Error actualizando elemento ${id}:`, error);
    return false;
  }
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
  
  // Calcular inversiones totales en amortizables
  state.amortizables.lokala.forEach(item => {
    inversiones += safeNum(item.cost);
  });
  state.amortizables.garraioa.forEach(item => {
    inversiones += safeNum(item.cost);
  });

  // Calcular gastos operativos ANUALES correctamente
  const gastosOperativosAnuales = calculateOperationalCosts();
  const mesesTesoreria = safeNum(document.getElementById('meses-tesoreria')?.value) || 3;
  
  // Tesorería = gastos mensuales * meses de cobertura
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

function calculateOperationalCosts() {
  let total = 0;

  // 1. Amortizaciones anuales
  Object.values(state.amortizables).forEach(category => {
    category.forEach(item => {
      const cost = safeNum(item.cost);
      const life = Math.max(1, safeNum(item.life));
      total += cost / life;
    });
  });

  // 2. Gastos recurrentes anuales
  Object.values(state.recurrings).forEach(category => {
    category.forEach(item => {
      total += safeNum(item.payment_cost) * Math.max(1, safeNum(item.frequency));
    });
  });

  // 3. Costes de personal anuales
  state.personnel.forEach(person => {
    const gross = safeNum(person.gross);
    const employerSS = safeNum(person.employer_ss) / 100;
    total += gross * (1 + employerSS);
  });

  return total;
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
    console.log("🔍 INICIANDO calculatePricing() - Verificando elementos...");  
    
    // LISTA MÍNIMA de elementos verdaderamente críticos
    const criticalElements = [
        'suggested-hourly-rate-sidebar',
        'total-facturacion'
    ];

    // Verificar solo elementos críticos
    const missingCritical = criticalElements.filter(id => !document.getElementById(id));
    if (missingCritical.length > 0) {
        console.warn("❌ Elementos críticos faltantes:", missingCritical);
        
        // CONTROL DE REINTENTOS - máximo 3 intentos
        if (!window.pricingRetryCount || window.pricingRetryCount < 3) {
            window.pricingRetryCount = (window.pricingRetryCount || 0) + 1;
            console.log(`🔄 Reintento ${window.pricingRetryCount}/3 en 300ms`);
            setTimeout(calculatePricing, 300);
            return;
        } else {
            console.error("❌ Demasiados reintentos, continuando sin elementos críticos");
            // Continuar de todos modos para evitar bucle infinito
        }
    }

    console.log("✅ Elementos críticos encontrados, procediendo con cálculos...");
    
    // RESETEAR CONTADOR cuando funciona
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

    console.log("🔍 Calculando pricing - Empleados:", employeeCount, "Horas totales:", totalHours);

    // ACTUALIZAR ELEMENTOS CON SEGURIDAD (sin generar errores)
    const updates = [
        { id: 'desglose-gastos-operativos', value: fmt(costesOperativos) },
        { id: 'desglose-costes-financieros', value: fmt(costesFinancieros) },
        { id: 'desglose-gastos-totales', value: fmt(costesTotales) },
        { id: 'desglose-porcentaje-margen', value: margin },
        { id: 'desglose-margen-bruto', value: fmt(margenBruto) },
        { id: 'desglose-facturacion-total', value: fmt(facturacionNecesaria) },
        { id: 'desglose-total-horas', value: totalHours.toLocaleString() },
        { id: 'desglose-precio-hora', value: fmt(precioHora) },
        { id: 'suggested-hourly-rate', value: fmt(precioHora) },
        { id: 'margen-bruto-panel7', value: fmt(margenBruto) },
        { id: 'expected-net-profit', value: fmt(beneficioNeto) },
        { id: 'required-annual-revenue', value: fmt(facturacionNecesaria) },
        { id: 'total-inversion', value: fmt(financiacion.inversiones) },
        { id: 'tesoreria-calculada', value: fmt(financiacion.tesoreria) },
        { id: 'necesidad-total', value: fmt(financiacion.necesidadesTotales) },
        { id: 'total-aportacion-socios', value: fmt(financiacion.aportacionesTotales) },
        { id: 'total-trabajadores', value: fmt(financiacion.aportacionesTrabajadores) },
        { id: 'total-capitalistas', value: fmt(financiacion.aportacionesCapitalistas) },
        { id: 'cantidad-financiar', value: fmt(financiacion.prestamoNecesario) },
        { id: 'cuota-anual-display', value: fmt(financiacion.cuotaAnual) },
        { id: 'total-socios-display', value: fmt(financiacion.aportacionesTotales) },
        { id: 'num-socios', value: state.finance.socios.length },
        { id: 'total-facturacion', value: fmt(facturacionNecesaria) },
        { id: 'gastos-operativos', value: fmt(costesOperativos) },
        { id: 'costos-financieros', value: fmt(costesFinancieros) },
        { id: 'margen-bruto', value: fmt(margenBruto) },
        { id: 'suggested-hourly-rate-sidebar', value: fmt(precioHora) },
        { id: 'employee-count-sidebar', value: employeeCount },
        { id: 'annual-hours-sidebar', value: totalHours.toLocaleString() },
        { id: 'total-amortizaciones', value: fmt(calculateTotalAmortizations()) },
        { id: 'total-gastos-fijos', value: fmt(calculateTotalRecurring()) },
        { id: 'total-personal', value: fmt(calculateTotalPersonnel()) },
        { id: 'total-intereses', value: fmt(financiacion.interesAnual) }
    ];

    // Actualizar todos los elementos de forma segura
    let updatedCount = 0;
    updates.forEach(({ id, value }) => {
        if (updateElement(id, value)) {
            updatedCount++;
        }
    });

    console.log(`✅ calculatePricing() completado - ${updatedCount}/${updates.length} elementos actualizados`);
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

window.removeSocio = function(id) {
  state.finance.socios = state.finance.socios.filter(s => s.id !== id);
  renderAllTables();
  updateAll();
};

// ¡ESTA ES LA FUNCIÓN QUE FALTABA!

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
  // Usar debounce para evitar múltiples ejecuciones
  if (window.updateTimeout) clearTimeout(window.updateTimeout);
  window.updateTimeout = setTimeout(() => {
    calculatePricing();
  }, 100);
}

// Función para diagnosticar el estado del DOM
function diagnoseDOM() {
  console.log("🔍 DIAGNÓSTICO DEL DOM:");
  console.log("Estado readyState:", document.readyState);
  console.log("Elementos en body:", document.body ? "EXISTE" : "NO EXISTE");
  
  const criticalElements = {
    'employee-count-sidebar': 'Sidebar - empleados',
    'annual-hours-sidebar': 'Sidebar - horas', 
    'desglose-porcentaje-margen': 'Panel 7 - % margen',
    'desglose-total-horas': 'Panel 7 - horas totales',
    'cantidad-financiar': 'Panel 6 - cantidad financiar',
    'cuota-anual-display': 'Panel 6 - cuota anual',
    'total-socios-display': 'Panel 6 - total socios',
    'num-socios': 'Panel 6 - num socios'
  };
  
  Object.entries(criticalElements).forEach(([id, desc]) => {
    const element = document.getElementById(id);
    console.log(`- ${desc} (${id}):`, element ? "✅ EXISTE" : "❌ NO EXISTE");
    
    if (element) {
      console.log(`  > Contenido actual: "${element.textContent}"`);
      console.log(`  > Tipo: ${element.tagName}, Clases: ${element.className}`);
    }
  });
  
  // Verificar también el sidebar completo
  const sidebar = document.querySelector('.sidebar');
  console.log("Sidebar completo:", sidebar ? "EXISTE" : "NO EXISTE");
  
  if (sidebar) {
    console.log("Elementos dentro del sidebar:");
    sidebar.querySelectorAll('[id]').forEach(el => {
      console.log(`  - ${el.id}: ${el.tagName}`);
    });
  }
}

// ===== INICIALIZACIÓN SIMPLIFICADA Y ROBUSTA =====
async function initializeApp() {
    console.log("🎯 Inicializando IDarte - Versión corregida...");
    
    // Estrategia simple: esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAppCore);
    } else {
        initializeAppCore();
    }
}

function initializeAppCore() {
    console.log("✅ DOM listo, inicializando componentes...");
    
    try {
        // 1. Cargar traducciones primero
        loadTranslations();
        
        // 2. Configurar componentes básicos
        setupLanguageSelector();
        setupTabNavigation();
        
        // 3. Cargar datos de ejemplo
        preloadSampleData();
        
        // 4. Renderizar tablas
        renderAllTables();
        
        // 5. Configurar event listeners globales
        setupGlobalEventListeners();
        
        // 6. Ejecutar cálculos iniciales después de un breve delay
        setTimeout(() => {
            updateAll();
            console.log("✅ IDarte completamente inicializado");
        }, 300);
        
    } catch (error) {
        console.error("💥 Error en inicialización:", error);
    }
}

// ===== INICIALIZACIÓN MEJORADA - MÁS ROBUSTA =====
async function initializeAppAsync() {
    console.log("🎯 Inicializando IDarte - Versión mejorada...");
    
    try {
        // FASE 1: Esperar a que el DOM esté completamente listo
        console.log("🔍 Fase 1: Verificando estado del DOM...");
        
        if (!document.body) {
            console.log("⏳ Body no disponible, esperando...");
            await waitForElement('body', 1000);
        }
        
        // FASE 2: Verificar elementos críticos con reintentos
        console.log("🔍 Fase 2: Verificando elementos críticos...");
        
        const criticalElements = [
            'employee-count-sidebar', 
            'annual-hours-sidebar',
            'main-sheet',
        ];
        
        const missingElements = await waitForCriticalElements(criticalElements, 5, 200);
        
        if (missingElements.length > 0) {
            console.error("❌ No se pudieron cargar elementos críticos después de múltiples intentos:", missingElements);
            showErrorToUser("No se pudieron cargar algunos componentes. Por favor, recarga la página.");
            return;
        }
        
        console.log("✅ Todos los elementos críticos cargados correctamente");
        
        // FASE 3: Cargar traducciones
        console.log("🔍 Fase 3: Cargando sistema de internacionalización...");
        await loadTranslations();
        
        // FASE 4: Configurar componentes básicos
        console.log("🔍 Fase 4: Configurando componentes de la aplicación...");
        setupLanguageSelector();
        setupTabNavigation();
        
        // FASE 5: Cargar datos y renderizar
        console.log("🔍 Fase 5: Cargando datos y renderizando interfaces...");
        preloadSampleData();
        renderAllTables();
        
        // FASE 6: Configurar event listeners
        console.log("🔍 Fase 6: Configurando event listeners...");
        setupGlobalEventListeners();
        
        // FASE 7: Ejecutar cálculos iniciales
        console.log("🔍 Fase 7: Ejecutando cálculos iniciales...");
        
        // Pequeña pausa para asegurar que todo está renderizado
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Forzar una actualización completa
        updateAll();
        
        // Verificación final
        setTimeout(() => {
            console.log("🔍 Verificación final del estado...");
            const finalCheck = document.getElementById('suggested-hourly-rate-sidebar');
            if (finalCheck && finalCheck.textContent !== '€ 0.00') {
                console.log("🎉 IDarte completamente operativo y mostrando datos");
            } else {
                console.warn("⚠️ Los cálculos podrían no haberse ejecutado correctamente");
                updateAll(); // Reintentar
            }
        }, 500);
        
    } catch (error) {
        console.error("💥 Error crítico durante la inicialización:", error);
        showErrorToUser("Error al inicializar la aplicación. Por favor, recarga la página.");
    }
}

// ===== FUNCIONES AUXILIARES MEJORADAS =====

/**
 * Espera a que un elemento esté disponible en el DOM
 */
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

/**
 * Espera a que múltiples elementos críticos estén disponibles
 */
async function waitForCriticalElements(elementIds, maxAttempts = 5, delay = 200) {
    let attempts = 0;
    let missingElements = [];
    
    while (attempts < maxAttempts) {
        missingElements = elementIds.filter(id => !document.getElementById(id));
        
        if (missingElements.length === 0) {
            console.log(`✅ Todos los elementos críticos cargados (intento ${attempts + 1}/${maxAttempts})`);
            return [];
        }
        
        attempts++;
        
        if (attempts < maxAttempts) {
            console.log(`⏳ Esperando elementos críticos... (intento ${attempts}/${maxAttempts})`, missingElements);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    console.error(`❌ Elementos faltantes después de ${maxAttempts} intentos:`, missingElements);
    return missingElements;
}

/**
 * Configura todos los event listeners globales
 */
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
    
    let configuredListeners = 0;
    
    globalInputs.forEach(({ id, event }) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener(event, updateAll);
            configuredListeners++;
            console.log(`✅ Listener [${event}] añadido para: ${id}`);
        } else {
            console.warn(`⚠️ No se pudo encontrar elemento para listener: ${id}`);
        }
    });
    
    console.log(`🔧 ${configuredListeners}/${globalInputs.length} listeners configurados correctamente`);
    
    // Configurar event listeners para inputs dinámicos
    setupDynamicEventListeners();
}

/**
 * Configura event listeners para elementos que se crean dinámicamente
 */
function setupDynamicEventListeners() {
    // Usar delegación de eventos para inputs dinámicos
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
    
    console.log("✅ Event listeners dinámicos configurados");
}

/**
 * Muestra un error al usuario de forma amigable
 */
function showErrorToUser(message) {
    // Crear un overlay de error
    const errorOverlay = document.createElement('div');
    errorOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        color: white;
        font-family: Arial, sans-serif;
    `;
    
    errorOverlay.innerHTML = `
        <div style="background: white; color: #333; padding: 2rem; border-radius: 8px; text-align: center; max-width: 400px;">
            <h3 style="color: #e53e3e; margin-bottom: 1rem;">Error de Inicialización</h3>
            <p>${message}</p>
            <button onclick="location.reload()" style="background: #3182ce; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; margin-top: 1rem; cursor: pointer;">
                Recargar Página
            </button>
        </div>
    `;
    
    document.body.appendChild(errorOverlay);
}

// ===== INICIALIZACIÓN PRINCIPAL CORREGIDA =====
async function initializeApp() {
    console.log("🚀 Iniciando aplicación IDarte...");
    
    // Estrategia de inicialización mejorada
    if (document.readyState === 'loading') {
        console.log("⏳ DOM aún cargando, esperando evento DOMContentLoaded...");
        document.addEventListener('DOMContentLoaded', async function() {
            console.log("✅ DOMContentLoaded disparado");
            await initializeAppAsync();
        });
    } else {
        console.log("✅ DOM ya está listo, inicializando directamente");
        await initializeAppAsync();
    }
    
    // Backup: también escuchar el evento load
    window.addEventListener('load', function() {
        console.log("📦 Evento load disparado - verificando estado");
        setTimeout(() => {
            // Verificar si la inicialización fue exitosa
            const hourlyRate = document.getElementById('suggested-hourly-rate-sidebar');
            if (!hourlyRate || hourlyRate.textContent === '€ 0.00') {
                console.log("🔄 Reinicializando desde evento load...");
                initializeAppAsync();
            }
        }, 1000);
    });
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
// Ejecutar cuando el DOM esté listo
console.log("🔧 Configurando inicialización automática...");

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log("✅ DOMContentLoaded - Inicializando IDarte");
        initializeApp();
    });
} else {
    console.log("✅ DOM ya listo - Inicializando IDarte inmediatamente");
    initializeApp();
}  
