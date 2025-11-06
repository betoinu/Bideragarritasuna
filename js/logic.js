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
    // 1. Inversiones totales (amortizables)
    const inversionTotal = calculateTotalInvestments();
    
    // 2. Tesorería (3-6 meses de gastos fijos)
    const mesesTesoreria = safeNum(document.getElementById('meses-tesoreria')?.value) || 3;
    const gastosFijosMensuales = (calculateTotalRecurring() + alculateTotalPersonnel()) / 12;
    const tesoreria = gastosFijosMensuales * mesesTesoreria;
    
    // 3. Necesidad total
    const necesidadesTotales = inversionTotal + tesoreria;
    
    return {
        inversionTotal: inversionTotal,
        tesoreria: tesoreria,
        necesidadesTotales: necesidadesTotales,
        gastosOperativosAnuales: calculateTotalRecurring() + alculateTotalPersonnel()
    };
}

function calculateTotalInvestments() {
    let total = 0;
    Object.values(state.amortizables).forEach(categoria => {
        categoria.forEach(item => {
            total += safeNum(item.coste) || 0;
        });
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

    // 🆕 AÑADIR CÁLCULOS PARA EL SIDEBAR
    const totalAmortizaciones = calculateTotalAmortizations();
    const totalGastosFijos = calculateTotalRecurring(); // ← nota el nombre diferente
    const totalPersonal = calculateTotalPersonnel();

    return {
        ...necesidades,
        aportacionesTrabajadores,
        aportacionesCapitalistas,
        aportacionesTotales,
        prestamoNecesario,
        cuotaAnual,
        interesAnual,
        // 🆕 DATOS PARA EL SIDEBAR
        totalAmortizaciones: totalAmortizaciones,
        totalGastosFijos: totalGastosFijos,
        totalPersonal: totalPersonal,
        // 🆕 ALIAS PARA COMPATIBILIDAD (por si los necesitas con otros nombres)
        totalAportadoSocios: aportacionesTotales,
        totalTrabajadores: aportacionesTrabajadores,
        totalCapitalistas: aportacionesCapitalistas
    };
}

function generarDiagnostico(brecha, capacidad, horasNecesarias, horasMaximas) {
    const currentLanguage = localStorage.getItem('selectedLanguage') || 'eu';
    
    const diagnosticos = {
        'eu': {
            critico: "❌ KRITIKOA: Gastu basikoak estaltzen ez dituzu. Igo prezioak edo bolumena.",
            sobrecarga: "⚠️ GAINEZKA: Langile gehiago behar dituzu edo azpikontratatu.",
            optimo: "✅ ONDO: Eskaria eta gaitasunaren arteko oreka ona.",
            aceptable: "📊 ONARGARRIA: Hazteko tartea duzu.",
            oportunidad: "📈 AIRABIDEA: Gaitasun asko dago. Bezero gehiago bilatu."
        },
        'es': {
            critico: "❌ CRÍTICO: No cubres gastos básicos. Aumenta precios o volumen.",
            sobrecarga: "⚠️ SOBRECARGA: Necesitas más personal o subcontratar.",
            optimo: "✅ ÓPTIMO: Buen equilibrio entre capacidad y demanda.",
            aceptable: "📊 ACEPTABLE: Tienes margen para crecer.",
            oportunidad: "📈 OPORTUNIDAD: Mucha capacidad disponible. Busca más clientes."
        },
        'en': {
            critico: "❌ CRITICAL: You don't cover basic expenses. Increase prices or volume.",
            sobrecarga: "⚠️ OVERLOAD: You need more staff or subcontract.",
            optimo: "✅ OPTIMAL: Good balance between capacity and demand.",
            aceptable: "📊 ACCEPTABLE: You have room to grow.",
            oportunidad: "📈 OPPORTUNITY: Lots of available capacity. Find more clients."
        }
    };
    
    const textos = diagnosticos[currentLanguage];
    
    if (brecha < 0) {
        return textos.critico;
    } else if (capacidad > 100) {
        return textos.sobrecarga;
    } else if (capacidad > 80) {
        return textos.optimo;
    } else if (capacidad > 50) {
        return textos.aceptable;
    } else {
        return textos.oportunidad;
    }
}

function actualizarUImetricas(meta, horas, precio, clientes, capacidad, ingresos, brecha, diagnostico) {
    const currentLanguage = localStorage.getItem('selectedLanguage') || 'eu';
    
    // Formatear números según idioma
    const formatoEuro = (valor) => {
        return `€ ${valor.toLocaleString(currentLanguage === 'en' ? 'en-US' : 'es-ES', {
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2
        })}`;
    };
    
    const formatoPorcentaje = (valor) => `${Math.min(valor, 100).toFixed(0)}%`;
    
    // Actualizar métricas principales
    document.getElementById('meta-supervivencia').textContent = formatoEuro(meta);
    document.getElementById('ingresos-proyectados').textContent = formatoEuro(ingresos);
    document.getElementById('brecha-supervivencia').textContent = formatoEuro(brecha);
    document.getElementById('diagnostico-supervivencia').textContent = diagnostico;
    
    // Actualizar métricas detalladas
    document.getElementById('metricas-horas-mes').textContent = `${Math.ceil(horas)}h`;
    document.getElementById('metricas-precio-hora').textContent = formatoEuro(precio);
    document.getElementById('metricas-clientes-mes').textContent = clientes;
    document.getElementById('metricas-capacidad').textContent = formatoPorcentaje(capacidad);
    
    // Color de la brecha
    const brechaElement = document.getElementById('brecha-supervivencia');
    brechaElement.style.color = brecha >= 0 ? '#059669' : '#dc2626';
    
    // Color de la capacidad
    const capacidadElement = document.getElementById('metricas-capacidad');
    if (capacidad > 100) {
        capacidadElement.style.color = '#dc2626';
    } else if (capacidad > 80) {
        capacidadElement.style.color = '#059669';
    } else if (capacidad > 50) {
        capacidadElement.style.color = '#d97706';
    } else {
        capacidadElement.style.color = '#6b7280';
    }
}

function calculatePortfolioRevenue {
    let total = 0;
    try {
        const inputs = document.querySelectorAll('#cartera-servicios-body input[type="number"]');
        const precios = [400, 200, 2000, 4000];
        
        inputs.forEach((input, index) => {
            const cantidad = parseInt(input.value) || 0;
            total += cantidad * precios[index];
        });
    } catch (error) {
        console.warn('⚠️ Error calculando ingresos cartera:', error);
    }
    return total;
}

// FUNCIONES AUXILIARES PARA PANEL 8
function calculateTotalAnnualExpenses() {
    try {
        const gastosOperativosText = document.getElementById('gastos-operativos-panel6')?.innerText || '0';
        const costesFinancierosText = document.getElementById('costes-financieros-panel6')?.innerText || '0';
        
        const gastosOperativos = parseFloat(gastosOperativosText.replace(/[€\.]/g, '').replace(',', '.')) || 0;
        const costesFinancieros = parseFloat(costesFinancierosText.replace(/[€\.]/g, '').replace(',', '.')) || 0;
        
        return gastosOperativos + costesFinancieros;
    } catch (error) {
        console.warn('⚠️ Error calculando gastos totales:', error);
        return 0;
    }
}


// FUNCIONES AUXILIARES PARA CÁLCULOS DEL PANEL 8
function calculateDailyHours(costesTotales, precioHora, personalProductivo) {
    if (!precioHora || precioHora === 0 || !personalProductivo || personalProductivo === 0) return '0 h/eguneko';
    const horasMensuales = (costesTotales / precioHora) / 12;
    const horasDiarias = horasMensuales / personalProductivo / 21;
    return Math.ceil(horasDiarias) + ' h/eguneko';
}

function calculateMonthlyClients(costesTotales, precioHora) {
    if (!precioHora || precioHora === 0) return '0';
    const horasMensuales = (costesTotales / precioHora) / 12;
    const clientes = horasMensuales / 40;
    return Math.ceil(clientes);
}

function calculateCapacityUtilization(costesTotales, precioHora, personalProductivo, horasPorEmpleado) {
    if (!precioHora || precioHora === 0 || !personalProductivo || personalProductivo === 0) return '0%';
    const horasMensuales = (costesTotales / precioHora) / 12;
    const capacidadMaxima = (personalProductivo * horasPorEmpleado) / 12;
    const capacidad = (horasMensuales / capacidadMaxima) * 100;
    return Math.min(capacidad, 100).toFixed(0) + '%';
}

function calculatePortfolioRevenue {
    let total = 0;
    try {
        const inputs = document.querySelectorAll('#cartera-servicios-body input[type="number"]');
        const precios = [400, 200, 2000, 4000];
        
        if (inputs.length === 0) return 0;
        
        inputs.forEach((input, index) => {
            const cantidad = parseInt(input.value) || 0;
            total += cantidad * precios[index];
        });
    } catch (error) {
        console.warn('⚠️ Error calculando ingresos cartera:', error);
        return 0;
    }
    return total;
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

    // ✅ CORRECCIÓN: Filtrar SOLO personal marcado como productivo
    const personalProductivo = state.personnel.filter(persona => {
        // Asegurar que esProductivo es booleano (true por defecto si no está definido)
        return persona.esProductivo !== false;
    });
    
    const employeeCount = Math.max(1, personalProductivo.length);
      
    const annualHours = safeNum(document.getElementById('annual-hours-per-employee')?.value) || 1600;
    const totalHours = employeeCount * annualHours;

    const costesTotales = costesOperativos + costesFinancieros;
    const margenBruto = costesTotales * (margin / 100);
    const facturacionNecesaria = costesTotales + margenBruto;
    const precioHora = totalHours > 0 ? facturacionNecesaria / totalHours : 0;

        // Verificar que precioHora no sea cero
    if (precioHora === 0) {
        console.warn('⚠️ Precio/hora es cero, revisar cálculos');
        precioHora = 1; // Valor mínimo para evitar divisiones por cero
    }

    const impuestos = margenBruto * (corporateTax / 100);
    const beneficioNeto = margenBruto - impuestos;

        console.log("📈 Datos calculados:", {
        personalTotal: state.personnel.length,
        personalProductivo: employeeCount,
        costesOperativos, 
        costesFinancieros, 
        facturacionNecesaria, 
        precioHora
    });

    // ACTUALIZACIONES DE LA INTERFAZ
    const updates = [
        // PANEL 7 - PREZIOA
        { id: 'contador-personal-productivo', value: employeeCount.toString() },
        { id: 'total-socios-display', value: fmt(financiacion.totalAportadoSocios) },
        { id: 'cantidad-financiar', value: fmt(financiacion.necesidadTotal) },
        { id: 'cuota-anual-display', value: fmt(costesFinancieros) },
        { id: 'gastos-operativos-panel6', value: fmt(costesOperativos) },
        { id: 'costes-financieros-panel6', value: fmt(costesFinancieros) },
        { id: 'gastos-totales-panel6', value: fmt(costesTotales) },

        // DESGLOSE PEDAGÓGICO
        { id: 'desglose-gastos-operativos', value: fmt(costesOperativos) },
        { id: 'desglose-costes-financieros', value: fmt(costesFinancieros) },
        { id: 'desglose-gastos-totales', value: fmt(costesTotales) },
        { id: 'desglose-total-horas', value: totalHours.toString() },
        { id: 'desglose-porcentaje-margen', value: margin.toString() },
        { id: 'desglose-margen-bruto', value: fmt(margenBruto) },
        { id: 'desglose-facturacion-total', value: fmt(facturacionNecesaria) },
        { id: 'desglose-precio-hora', value: fmt(precioHora) },

        // RESULTADOS PRINCIPALES
        { id: 'suggested-hourly-rate', value: fmt(precioHora) },
        { id: 'margen-bruto-panel7', value: fmt(margenBruto) },
        { id: 'expected-net-profit', value: fmt(beneficioNeto) },

        // SIDEBAR
        { id: 'contador-personal-productivo', value: employeeCount.toString() },
        { id: 'annual-hours-sidebar', value: totalHours.toString() },
        { id: 'employee-count-sidebar', value: employeeCount.toString() },

        // 🆕 PANEL 8 - BIDERAGARRITASUN UPDATES
        { id: 'meta-supervivencia', value: fmt(costesTotales / 12) },
        { id: 'ingresos-proyectados', value: fmt(calculatePortfolioRevenue) },
        { id: 'brecha-supervivencia', value: fmt(calculatePortfolioRevenue - (costesTotales / 12)) },
        { id: 'metricas-horas-mes', value: calculateDailyHours(costesTotales, precioHora, employeeCount) },
        { id: 'metricas-precio-hora', value: fmt(precioHora) },
        { id: 'metricas-clientes-mes', value: calculateMonthlyClients(costesTotales, precioHora) },
        { id: 'metricas-capacidad', value: calculateCapacityUtilization(costesTotales, precioHora, employeeCount, annualHours) },
        { id: 'total-ingresos-cartera', value: '€ ' + calculatePortfolioRevenue.toLocaleString() },
        { id: 'estrategia-activa', value: 'Ninguna' },

        // SIDEBAR CONTINUACIÓN
        { id: 'suggested-hourly-rate-sidebar', value: fmt(precioHora) },
        { id: 'employee-count-sidebar', value: employeeCount.toString() },
        { id: 'annual-hours-sidebar', value: totalHours.toString() },
        { id: 'total-facturacion', value: fmt(facturacionNecesaria) },

        // FINANZAS SIDEBAR
        { id: 'finantzaketa-total-calculada', value: fmt(financiacion.necesidadTotal) },
        { id: 'inversion-total-sidebar', value: fmt(financiacion.inversionTotal) },
        { id: 'tesoreria-sidebar', value: fmt(financiacion.tesoreria) },
        { id: 'aportacion-total-sidebar', value: fmt(financiacion.totalAportadoSocios) },
        { id: 'aportacion-trabajadores-sidebar', value: fmt(financiacion.totalTrabajadores) },
        { id: 'aportacion-capitalistas-sidebar', value: fmt(financiacion.totalCapitalistas) },
        { id: 'finantzaketa-neta-sidebar', value: fmt(financiacion.necesidadTotal - financiacion.totalAportadoSocios) },

        // DESGLOSE COSTES SIDEBAR
        { id: 'total-amortizaciones-sidebar', value: fmt(financiacion.totalAmortizaciones) },
        { id: 'total-gastos-fijos-sidebar', value: fmt(financiacion.totalGastosFijos) },
        { id: 'total-personal-sidebar', value: fmt(financiacion.totalPersonal) },
        { id: 'costos-financieros-sidebar', value: fmt(costesFinancieros) },
        { id: 'margen-bruto-sidebar', value: fmt(margenBruto) },

        // PANEL 6 - FINANTZAKETA
        { id: 'total-inversion', value: fmt(financiacion.inversionTotal) },
        { id: 'tesoreria-calculada', value: fmt(financiacion.tesoreria) },
        { id: 'necesidad-total', value: fmt(financiacion.necesidadTotal) },
        { id: 'total-aportacion-socios', value: fmt(financiacion.totalAportadoSocios || 0) },
        { id: 'total-trabajadores', value: fmt(financiacion.totalTrabajadores || 0) },
        { id: 'total-capitalistas', value: fmt(financiacion.totalCapitalistas || 0) }
        
    ];

    // APLICAR TODAS LAS ACTUALIZACIONES
    updates.forEach(update => {
        if (update.id && update.value !== undefined && update.value !== null) {
            updateElement(update.id, update.value);
        }
    });

    console.log("✅ calculatePricing() completado - Personal:", 
        state.personnel.length, "total,", employeeCount, "productivos");

    return {
        facturacionNecesaria,
        precioHora,
        margenBruto,
        beneficioNeto,
        personalProductivo: employeeCount,
        horasTotales: totalHours
    };
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
        employer_ss: 30,
        esProductivo: true  // ← NUEVO CAMPO
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
    
    // ✅ CORRECCIÓN: Manejar correctamente los checkboxes
    let value;
    if (el.type === 'checkbox') {
        value = el.checked;
    } else if (el.type === 'number') {
        value = safeNum(el.value);
    } else {
        value = el.value;
    }

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
        if (person) { 
            person[field] = value; 
            found = true; 
            console.log(`👤 Personal actualizado: ${person.role} - esProductivo: ${value}`);
        }
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
            <td style="min-width: 300px;"><input value="${item.name}" data-id="${item.id}" data-field="name" style="width: 100%; border: none; background: transparent;"></td>
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
            <td style="min-width: 300px;"><input value="${item.name}" data-id="${item.id}" data-field="name" style="width: 100%; border: none; background: transparent;"></td>
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
            <td style="min-width: 300px;"><input value="${item.role}" data-id="${item.id}" data-field="role" style="width: 100%; border: none; background: transparent;"></td>
            <td class="text-right"><input type="number" value="${item.gross}" data-id="${item.id}" data-field="gross"></td>
            <td class="text-center"><input type="number" value="${item.employer_ss}" data-id="${item.id}" data-field="employer_ss"></td>
            <td class="text-center">
                <input type="checkbox" ${item.esProductivo ? 'checked' : ''} 
                       data-id="${item.id}" data-field="esProductivo"
                       onchange="this.value = this.checked; window.onFieldChange({target: this})">
            </td>
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
        // 🆕 ACTUALIZAR PANEL 8
        if (typeof updateBideragarritasuna === 'function') updateBideragarritasuna();
    }, 100);
}

// ===== PANEL 8 - ESTRATEGIA Y SUPERVIVENCIA =====
window.estrategiaActiva = null;

window.updatePortfolio = function() {
    // Calcular ingresos de cada servicio
    const servicios = [
        { id: 'rapido', precio: 400, horas: 8 },
        { id: 'consultoria', precio: 200, horas: 4 },
        { id: 'medio', precio: 2000, horas: 40 },
        { id: 'grande', precio: 4000, horas: 80 }
    ];
    
    let totalIngresos = 0;
    let totalHoras = 0;
    let totalClientes = 0;
    
    servicios.forEach((servicio, index) => {
        const cantidad = parseInt(document.querySelectorAll('#cartera-servicios-body input[type="number"]')[index]?.value) || 0;
        const ingresos = cantidad * servicio.precio;
        totalIngresos += ingresos;
        totalHoras += cantidad * servicio.horas;
        totalClientes += cantidad;
        
        // Actualizar columna de ingresos
        updateElement(`ingresos-${servicio.id}`, `€ ${ingresos.toLocaleString()}`);
    });
    
    // Actualizar totales
    updateElement('total-ingresos-cartera', `€ ${totalIngresos.toLocaleString()}`);
    updateElement('ingresos-proyectados', fmt(totalIngresos));
    
    // Calcular métricas de supervivencia
    const metaSupervivencia = safeNum(document.getElementById('desglose-facturacion-total')?.textContent.replace(/[^\d,.-]/g, '') || 0);
    const brecha = metaSupervivencia - totalIngresos;
    
    updateElement('meta-supervivencia', fmt(metaSupervivencia));
    updateElement('brecha-supervivencia', fmt(brecha));
    
    // Actualizar diagnóstico
    const diagnostico = document.getElementById('diagnostico-supervivencia');
    if (diagnostico) {
        if (brecha <= 0) {
            diagnostico.textContent = '✅ VIABLE - Cubres gastos';
            diagnostico.parentElement.style.background = '#e8f5e8';
        } else if (brecha < metaSupervivencia * 0.2) {
            diagnostico.textContent = '⚠️ CASI - Cerca del objetivo';
            diagnostico.parentElement.style.background = '#fff3cd';
        } else {
            diagnostico.textContent = '🔴 CRÍTICO - Lejos del objetivo';
            diagnostico.parentElement.style.background = '#ffeaa7';
        }
    }
    
    // Actualizar métricas críticas
    const horasMensuales = totalHoras / 12;
    const precioHoraEfectivo = totalHoras > 0 ? totalIngresos / totalHoras : 0;
    const clientesMensuales = totalClientes / 12;
    const capacidadTotal = safeNum(document.getElementById('annual-hours-per-employee')?.value) * 
                          safeNum(document.getElementById('employee-count-sidebar')?.textContent);
    const capacidadUtilizada = capacidadTotal > 0 ? (totalHoras / capacidadTotal) * 100 : 0;
    
    updateElement('metricas-horas-mes', `${Math.ceil(horasMensuales)}h`);
    updateElement('metricas-precio-hora', fmt(precioHoraEfectivo));
    updateElement('metricas-clientes-mes', Math.ceil(clientesMensuales));
    updateElement('metricas-capacidad', `${Math.round(capacidadUtilizada)}%`);
};

window.aplicarEstrategia = function(tipo) {
    window.estrategiaActiva = tipo;
    updateElement('estrategia-activa', tipo.charAt(0).toUpperCase() + tipo.slice(1));
    
    // Aplicar factores según estrategia
    const factores = {
        premium: { precio: 1.2, clientes: 0.7 },
        equilibrado: { precio: 1.05, clientes: 1.1 },
        volumen: { precio: 0.9, clientes: 1.5 }
    };
    
    const factor = factores[tipo];
    
    // Aplicar a todos los inputs de cantidad
    const inputs = document.querySelectorAll('#cartera-servicios-body input[type="number"]');
    inputs.forEach(input => {
        const valorActual = parseInt(input.value) || 0;
        const nuevoValor = Math.round(valorActual * factor.clientes);
        input.value = nuevoValor;
    });
    
    // Recalcular
    updatePortfolio();
};

// Inicialización del Panel 8
setTimeout(() => {
    if (typeof updatePortfolio === 'function') updatePortfolio();
}, 1000);

// Inicializazioa automática
setTimeout(() => {
    if (typeof renderZerbitzuak === 'function') renderZerbitzuak();
    if (typeof renderBenchmarking === 'function') renderBenchmarking();
    if (typeof updateBideragarritasuna === 'function') updateBideragarritasuna();
}, 1000);


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

          // 🆕 INICIALIZAR PANEL 8
    setTimeout(() => {
        if (typeof renderZerbitzuak === 'function') renderZerbitzuak();
        if (typeof renderBenchmarking === 'function') renderBenchmarking();
        if (typeof updateBideragarritasuna === 'function') updateBideragarritasuna();
    }, 500);
     
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
