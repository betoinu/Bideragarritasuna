// js/logic.js
// IDarte - lógica completa: tabs, creación de paneles, tablas, cálculos, idioma y PDF
// Reemplaza totalmente el fichero anterior

/* ============
   GLOBAL STATE
   ============ */
const state = {
  amortizables: { lokala: [], garraioa: [] },
  recurrings: { lokala: [], ekoizpena: [], garraioa: [], hazkuntza: [] },
  personnel: [],
  partners: [0,0,0],
  finance: { loanAmount:0, loanTAE:5, loanTerm:5, annualInterest:0, totalFinancialCost:0 }
};

let translations = {}; // cargadas desde lang/lang.json o fallback
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
    "contact.title":"Kontaktua",
    "contact.name":"Josu Ayerbe Guarás, Barne Diseinuko Graduko irakaslea",
    "contact.email":"josuayerbe@idarte.eus",
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
    "contact.title":"Contacto",
    "contact.name":"Josu Ayerbe Guarás, profesor del Grado en Diseño de Interiores",
    "contact.email":"josuayerbe@idarte.eus",
    "footer.note":"IDarte · Escuela Pública de Diseño de Euskadi — Euskadiko Diseinu Eskola Publikoa.",
    "loading":"Preparando el informe..."
  }
};

/* ================
   UTILIDADES BÁSICAS
   ================ */
function uid(prefix='id'){ return prefix + '-' + Math.random().toString(36).slice(2,9); }
function fmt(n){ // formatea número a € con 2 decimales
  n = Number(n)||0;
  try{ return new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(n); }catch(e){ return '€ ' + n.toFixed(2); }
}
function safeNum(v){ return Number(v || 0) || 0; }
function qs(sel){ return document.querySelector(sel); }
function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }

/* ===========================
   CARGA TRADUCCIONES (lang.json)
   =========================== */
async function loadTranslations(langRequested){
  try{
    const res = await fetch('lang/lang.json');
    if(!res.ok) throw new Error('no JSON');
    const all = await res.json();
    translations = all;
    applyTranslations(langRequested || (localStorage.getItem('selectedLanguage') || 'eu'));
    return;
  }catch(e){
    // fallback si fetch falla (p. ej. testing con file://)
    translations = fallbackTranslations;
    applyTranslations(langRequested || (localStorage.getItem('selectedLanguage') || 'eu'));
  }
}

function applyTranslations(lang){
  if(!translations || !translations[lang]) translations = fallbackTranslations;
  const strings = translations[lang] || {};
  qsa('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    if(key && strings[key]) el.textContent = strings[key];
  });
  // boton especial
  const dl = document.getElementById('download-report-btn');
  if(dl) dl.textContent = (strings['button.download'] || dl.textContent);
  localStorage.setItem('selectedLanguage', lang);
  document.documentElement.lang = lang;
}

/* ===========================
   CONSTRUCCIÓN DINÁMICA DE PANELES
   =========================== */
// Si los paneles están vacíos (tienen '…' o sin hijos) los rellenamos con contenido completo.
function buildPanelsIfEmpty(){
  const lok = document.getElementById('lokala-sheet');
  if(lok && (!lok.innerHTML.trim() || lok.textContent.trim()==='…')){
    lok.innerHTML = `
      <h2><span data-i18n="section.lokala">1 · Lokalaren Gastu Finkoak eta Inbertsioak</span></h2>
      <div style="display:grid;grid-template-columns:1fr 320px;gap:12px;margin-top:12px;">
        <div>
          <h3>A) Inbertsio amortizagarriak</h3>
          <div style="overflow:auto">
            <table class="min-w" style="width:100%">
              <thead><tr><th>Kontzeptua</th><th style="text-align:right">Kostua</th><th style="text-align:center">Urteak</th><th style="text-align:right">Urteko Amortiz.</th><th></th></tr></thead>
              <tbody id="lokala-amortizable-body"></tbody>
            </table>
          </div>
          <button class="btn" onclick="addAmortizable('lokala')">+ Gehitu</button>

          <h3 style="margin-top:16px">B) Gastu errepikari finkoak</h3>
          <table class="min-w" style="width:100%"><thead><tr><th>Kontzeptua</th><th style="text-align:right">Ordainketa</th><th style="text-align:center">Maiztasuna</th><th style="text-align:right">Urteko Guztizkoa</th><th></th></tr></thead>
            <tbody id="lokala-recurring-body"></tbody>
          </table>
          <button class="btn" onclick="addRecurring('lokala')">+ Gehitu gastu errepikari</button>
        </div>
        <aside style="padding:8px">
          <div class="card"><h4>Gastu eta Amortizazio laburra</h4><p id="lokal-summary" class="muted">-</p></div>
          <div class="card"><h4>Lokalaren Inbertsio Osoa</h4><p id="total-local-investment" class="value">€ 0.00</p></div>
          <div class="card"><h4>Urteko Amortizazioa</h4><p id="total-local-amortization" class="value">€ 0.00</p></div>
          <div class="card"><h4>Lokalaren Urteko Kostu FINKOAK</h4><p id="total-local-annual-cost" class="value">€ 0.00</p></div>
        </aside>
      </div>
    `;
  }

  const per = document.getElementById('pertsonala-sheet');
  if(per && (!per.innerHTML.trim() || per.textContent.trim()==='…')){
    per.innerHTML = `
      <h2><span data-i18n="section.pertsonala">2 · Pertsonalaren Kostuak</span></h2>
      <div style="display:grid;grid-template-columns:2fr 1fr;gap:12px;margin-top:12px;">
        <div>
          <h3>Langileak</h3>
          <table class="min-w" style="width:100%"><thead><tr><th>Funtzioa</th><th style="text-align:right">Soldata gordina</th><th style="text-align:center">Seg. S. (%)</th><th style="text-align:right">Kostu osoa</th><th></th></tr></thead>
            <tbody id="personnel-body"></tbody></table>
          <button class="btn" onclick="addPerson()">+ Gehitu langile</button>
          <div style="margin-top:12px" class="card"><h4>Pertsonalaren Kostu Osoa</h4><p id="total-personnel-cost" class="value">€ 0.00</p></div>
        </div>
        <div style="background:#fff;padding:12px;border-radius:8px;border:1px solid #eee">
          <h4>Soldata Garbia Kalkulagailua</h4>
          <label>Soldata gordina urtekoa:</label><input id="grossSalary" type="number" value="25000" oninput="calcNetSalary()" />
          <label>IRPF (%)</label><input id="irpfRate" type="number" value="15" oninput="calcNetSalary()" />
          <p>SS kenaria: <span id="ssDeduction">€ 0.00</span></p>
          <p>Soldata Garbia (hilean, 14 ord): <span id="netMonthlySalary">€ 0.00</span></p>
        </div>
      </div>`;
  }

  const eko = document.getElementById('ekoizpena-sheet');
  if(eko && (!eko.innerHTML.trim() || eko.textContent.trim()==='…')){
    eko.innerHTML = `
      <h2><span data-i18n="section.ekoizpena">3 · Ekoizpen Gastuak</span></h2>
      <table class="min-w" style="width:100%"><thead><tr><th>Kontzeptua</th><th style="text-align:right">Ordainketa</th><th style="text-align:center">Maiztasuna</th><th style="text-align:right">Urteko Guztizkoa</th><th></th></tr></thead>
      <tbody id="ekoizpena-recurring-body"></tbody></table>
      <button class="btn" onclick="addRecurring('ekoizpena')">+ Gehitu</button>
      <div style="margin-top:12px" class="card"><h4>Ekoizpen Kostua</h4><p id="total-production-cost" class="value">€ 0.00</p></div>`;
  }

  const gar = document.getElementById('garraioa-sheet');
  if(gar && (!gar.innerHTML.trim() || gar.textContent.trim()==='…')){
    gar.innerHTML = `
      <h2><span data-i18n="section.garraioa">4 · Garraioa</span></h2>
      <h3>Inbertsio amortizagarriak</h3>
      <table class="min-w" style="width:100%"><thead><tr><th>Kontzeptua</th><th style="text-align:right">Kostua</th><th style="text-align:center">Urteak</th><th style="text-align:right">Urteko Amortiz.</th><th></th></tr></thead>
        <tbody id="garraioa-amortizable-body"></tbody></table>
      <button class="btn" onclick="addAmortizable('garraioa')">+ Gehitu inbertsio</button>
      <h3 style="margin-top:12px">Gastu errepikariak</h3>
      <table class="min-w" style="width:100%"><tbody id="garraioa-recurring-body"></tbody></table>`;
  }

  const haz = document.getElementById('hazkuntza-sheet');
  if(haz && (!haz.innerHTML.trim() || haz.textContent.trim()==='…')){
    haz.innerHTML = `
      <h2><span data-i18n="section.hazkuntza">5 · Hazkuntza eta Marketina</span></h2>
      <table class="min-w" style="width:100%"><thead><tr><th>Kontzeptua</th><th style="text-align:right">Ordainketa</th><th style="text-align:center">Maiztasuna</th><th style="text-align:right">Urteko Guztizkoa</th><th></th></tr></thead>
      <tbody id="hazkuntza-recurring-body"></tbody></table>
      <button class="btn" onclick="addRecurring('hazkuntza')">+ Gehitu</button>
      <div style="margin-top:12px" class="card"><h4>Urteko Plan</h4><p id="total-growth-cost" class="value">€ 0.00</p></div>`;
  }

  const fin = document.getElementById('finantzaketa-sheet');
  if(fin && (!fin.innerHTML.trim() || fin.textContent.trim()==='…')){
    fin.innerHTML = `
      <h2><span data-i18n="section.finantzaketa">6 · Finantzaketa</span></h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div>
          <h4>Finantzaketa behar</h4>
          <p id="total-finance-needed">€ 0.00</p>
          <div><label>Bazkide 1</label><input id="partner-capital-1" type="number" value="0" /></div>
          <div><label>Bazkide 2</label><input id="partner-capital-2" type="number" value="0" /></div>
          <div><label>Bazkide 3</label><input id="partner-capital-3" type="number" value="0" /></div>
          <p>Total: <span id="total-partner-capital">€ 0.00</span></p>
          <p>Finantzia Defizita: <span id="finance-deficit">€ 0.00</span></p>
          <p>Suggested Loan: <span id="suggested-loan">€ 0.00</span></p>
        </div>
        <div>
          <h4>Maileguaren ezarpenak</h4>
          <label>Mailegu zenb:</label><input id="loan-amount" type="number" value="0" />
          <label>TAE (%):</label><input id="loan-tae" type="number" value="5" step="0.1" />
          <label>Iraupena (urte):</label><input id="loan-term" type="number" value="5" />
          <p>Urteko interes gastua: <span id="annual-interest-cost">€ 0.00</span></p>
          <p>Finantza gastu totala: <span id="total-financial-cost">€ 0.00</span></p>
        </div>
      </div>`;
  }

  const prez = document.getElementById('prezioa-sheet');
  if(prez && (!prez.innerHTML.trim() || prez.textContent.trim()==='…')){
    prez.innerHTML = `
      <h2><span data-i18n="section.prezioa">7 · Lanorduaren prezioa eta Mozkinak</span></h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start;">
        <div class="form-grid">
          <label>Sozietateen Zerga (%)</label><input id="corporate-tax" type="number" value="25" />
          <label>Mozkin helburua (%)</label><input id="target-profit-margin" type="number" value="20" />
          <label>Langile kopurua</label><input id="employee-count" type="number" value="2" />
          <label>Urteko orduak/langileko</label><input id="annual-hours-per-employee" type="number" value="1600" />
        </div>
        <div>
          <div class="card"><h4>Urteko lan-orduak guzt.</h4><p id="total-available-hours" class="value">0</p></div>
          <div class="card"><h4>Gomendatutako orduko prezioa</h4><p id="suggested-hourly-rate" class="value">€ 0.00</p></div>
          <div class="card"><h4>Espero den mozkin garbia</h4><p id="expected-net-profit" class="value">€ 0.00</p></div>
        </div>
      </div>`;
  }
}

/* =========================
   RENDERIZADO Y CRUD TABLAS
   ========================= */
function renderAllTables(){
  // amortizables lokala + garraioa
  const lokAmortTbody = document.getElementById('lokala-amortizable-body');
  const garAmortTbody = document.getElementById('garraioa-amortizable-body');
  if(lokAmortTbody) lokAmortTbody.innerHTML = '';
  if(garAmortTbody) garAmortTbody.innerHTML = '';

  state.amortizables.lokala.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><input value="${item.name}" data-id="${item.id}" data-field="name" class="input-style" onchange="onFieldChange(event)"/></td>
                    <td style="text-align:right"><input type="number" value="${item.cost}" data-id="${item.id}" data-field="cost" class="input-style" onchange="onFieldChange(event)"/></td>
                    <td style="text-align:center"><input type="number" value="${item.life}" data-id="${item.id}" data-field="life" class="input-style" onchange="onFieldChange(event)"/></td>
                    <td style="text-align:right" id="${item.id}-annual">`+fmt(item.cost/item.life)+`</td>
                    <td style="text-align:center"><button onclick="removeAmortizable('${item.id}','lokala')" class="btn small">✕</button></td>`;
    lokAmortTbody.appendChild(tr);
  });

  state.amortizables.garraioa.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><input value="${item.name}" data-id="${item.id}" data-field="name" class="input-style" onchange="onFieldChange(event)"/></td>
                    <td style="text-align:right"><input type="number" value="${item.cost}" data-id="${item.id}" data-field="cost" class="input-style" onchange="onFieldChange(event)"/></td>
                    <td style="text-align:center"><input type="number" value="${item.life}" data-id="${item.id}" data-field="life" class="input-style" onchange="onFieldChange(event)"/></td>
                    <td style="text-align:right" id="${item.id}-annual">`+fmt(item.cost/item.life)+`</td>
                    <td style="text-align:center"><button onclick="removeAmortizable('${item.id}','garraioa')" class="btn small">✕</button></td>`;
    garAmortTbody.appendChild(tr);
  });

  // recurrings
  const renderRecurringFor = (category, tbodyId) => {
    const tbody = document.getElementById(tbodyId);
    if(!tbody) return;
    tbody.innerHTML = '';
    state.recurrings[category].forEach(item => {
      const annual = item.payment_cost * item.frequency;
      const tr = document.createElement('tr');
      tr.innerHTML = `<td><input value="${item.name}" data-id="${item.id}" data-field="name" class="input-style" onchange="onFieldChange(event)"/></td>
                      <td style="text-align:right"><input type="number" value="${item.payment_cost}" data-id="${item.id}" data-field="payment_cost" class="input-style" onchange="onFieldChange(event)"/></td>
                      <td style="text-align:center"><input type="number" value="${item.frequency}" data-id="${item.id}" data-field="frequency" class="input-style" onchange="onFieldChange(event)"/></td>
                      <td style="text-align:right" id="${item.id}-annual">`+fmt(annual)+`</td>
                      <td style="text-align:center"><button onclick="removeRecurring('${item.id}','${category}')" class="btn small">✕</button></td>`;
      tbody.appendChild(tr);
    });
  };
  renderRecurringFor('lokala','lokala-recurring-body');
  renderRecurringFor('ekoizpena','ekoizpena-recurring-body');
  renderRecurringFor('garraioa','garraioa-recurring-body');
  renderRecurringFor('hazkuntza','hazkuntza-recurring-body');

  // personnel
  const tbodyPers = document.getElementById('personnel-body');
  if(tbodyPers) tbodyPers.innerHTML = '';
  state.personnel.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><input value="${p.role}" data-id="${p.id}" data-field="role" class="input-style" onchange="onFieldChange(event)"/></td>
                    <td style="text-align:right"><input type="number" value="${p.gross}" data-id="${p.id}" data-field="gross" class="input-style" onchange="onFieldChange(event)"/></td>
                    <td style="text-align:center"><input type="number" value="${p.employer_ss}" data-id="${p.id}" data-field="employer_ss" class="input-style" onchange="onFieldChange(event)"/></td>
                    <td style="text-align:right" id="${p.id}-total">`+fmt(p.gross*(1+p.employer_ss/100))+`</td>
                    <td style="text-align:center"><button onclick="removePersonnel('${p.id}')" class="btn small">✕</button></td>`;
    tbodyPers.appendChild(tr);
  });
}

/* =========================
   MANEJADORES CRUD
   ========================= */
window.addAmortizable = function(category){
  const obj = { id: uid('am'), name: 'Ekipamendua', cost: 1000, life: 5, category };
  state.amortizables[category].push(obj);
  renderAllTables();
  updateAll();
};

window.addRecurring = function(category){
  const obj = { id: uid('r'), name: 'Gastu', payment_cost: 100, frequency: 12, category };
  state.recurrings[category].push(obj);
  renderAllTables();
  updateAll();
};

window.addPerson = function(){
  const p = { id: uid('p'), role: 'Diseinatzaile', gross: 25000, employer_ss: 30 };
  state.personnel.push(p);
  renderAllTables();
  updateAll();
};

window.removeAmortizable = function(id, category){
  state.amortizables[category] = state.amortizables[category].filter(i => i.id !== id);
  renderAllTables();
  updateAll();
};

window.removeRecurring = function(id, category){
  state.recurrings[category] = state.recurrings[category].filter(i => i.id !== id);
  renderAllTables();
  updateAll();
};

window.removePersonnel = function(id){
  state.personnel = state.personnel.filter(p => p.id !== id);
  renderAllTables();
  updateAll();
};

window.onFieldChange = function(e){
  const el = e.target;
  const id = el.dataset.id;
  const field = el.dataset.field;
  const value = el.type === 'number' ? safeNum(el.value) : el.value;
  // find in arrays
  ['lokala','garraioa'].forEach(cat=>{
    const idx = state.amortizables[cat].findIndex(x=>x.id===id);
    if(idx>-1){ state.amortizables[cat][idx][field] = value; renderAllTables(); updateAll(); }
  });
  ['lokala','ekoizpena','garraioa','hazkuntza'].forEach(cat=>{
    const idx = state.recurrings[cat].findIndex(x=>x.id===id);
    if(idx>-1){ state.recurrings[cat][idx][field] = value; renderAllTables(); updateAll(); }
  });
  const pidx = state.personnel.findIndex(x=>x.id===id);
  if(pidx>-1){ state.personnel[pidx][field] = value; renderAllTables(); updateAll(); }
};

/* =========================
   CÁLCULOS PRINCIPALES
   ========================= */
function updateAll(){
  // amortization totals
  let localInvestment=0, localAmort=0;
  let transportInvestment=0, transportAmort=0;
  Object.values(state.amortizables).forEach(arr=>{
    arr.forEach(it=>{
      if(it.category==='lokala'){ localInvestment += safeNum(it.cost); localAmort += (safeNum(it.life)>0? safeNum(it.cost)/safeNum(it.life):0); }
      if(it.category==='garraioa'){ transportInvestment += safeNum(it.cost); transportAmort += (safeNum(it.life)>0? safeNum(it.cost)/safeNum(it.life):0); }
    });
  });

  // recurring totals
  let locRec=0, prodRec=0, transRec=0, growthRec=0;
  Object.keys(state.recurrings).forEach(cat=>{
    state.recurrings[cat].forEach(it=>{
      const ann = safeNum(it.payment_cost) * safeNum(it.frequency);
      if(cat==='lokala') locRec += ann;
      if(cat==='ekoizpena') prodRec += ann;
      if(cat==='garraioa') transRec += ann;
      if(cat==='hazkuntza') growthRec += ann;
    });
  });

  // personnel
  let totalPersonnelCost = 0;
  state.personnel.forEach(p=>{
    totalPersonnelCost += safeNum(p.gross) * (1 + safeNum(p.employer_ss)/100);
  });

  // financial cost already in state.finance
  const totalFinancial = safeNum(state.finance.totalFinancialCost);

  // DOM set
  const trySet = (id,v)=>{ const el = document.getElementById(id); if(el) el.textContent = (typeof v === 'number')? fmt(v): v; };

  trySet('total-local-investment', localInvestment);
  trySet('total-local-amortization', localAmort);
  trySet('total-local-recurring', locRec);
  trySet('total-local-annual-cost', localAmort + locRec);

  trySet('total-production-cost', prodRec);
  trySet('total-transport-annual-cost', transportAmort + transRec);
  trySet('total-growth-cost', growthRec);

  trySet('total-personnel-cost', totalPersonnelCost);

  // global summary
  const totalFixed = localAmort + locRec + totalPersonnelCost;
  const totalVariable = prodRec + transRec + growthRec;
  const totalOperational = totalFixed + totalVariable + totalFinancial;

  trySet('total-fixed-annual-cost', totalFixed);
  trySet('total-variable-annual-cost', totalVariable);
  trySet('total-financial-cost', totalFinancial);
  trySet('total-operational-cost', totalOperational);

  // update right panel summary (specific per active tab)
  updateRightSummary();
}

/* =========================
   FINANCE / LOAN
   ========================= */
function updateFinanceInputs(){
  state.partners[0] = safeNum(document.getElementById('partner-capital-1')?.value);
  state.partners[1] = safeNum(document.getElementById('partner-capital-2')?.value);
  state.partners[2] = safeNum(document.getElementById('partner-capital-3')?.value);
  const totalPartner = state.partners.reduce((s,v)=>s+v,0);
  const elp = document.getElementById('total-partner-capital'); if(elp) elp.textContent = fmt(totalPartner);

  // calculate finance needed (simple heuristic)
  const investmentSum = state.amortizables.lokala.concat(state.amortizables.garraioa).reduce((s,i)=>s+safeNum(i.cost),0);
  const recurringAnnual = Object.keys(state.recurrings).reduce((s,cat)=> s + state.recurrings[cat].reduce((ss,it)=> ss + safeNum(it.payment_cost)*safeNum(it.frequency),0), 0);
  const personnelAnnual = state.personnel.reduce((s,p)=> s+ safeNum(p.gross)*(1+safeNum(p.employer_ss)/100),0);
  const runway = (recurringAnnual + personnelAnnual)/4; // 3 months ~ quarter approximated
  const needed = investmentSum + runway;
  const nf = document.getElementById('total-finance-needed'); if(nf) nf.textContent = fmt(needed);
  const deficit = Math.max(0, needed - totalPartner);
  const dfEl = document.getElementById('finance-deficit'); if(dfEl) dfEl.textContent = fmt(deficit);
  const suggestedLoanEl = document.getElementById('suggested-loan'); if(suggestedLoanEl) suggestedLoanEl.textContent = fmt(deficit);
}

window.updateFinanceStrategy = function(){
  updateFinanceInputs();
  updateAll();
};

window.updateLoanCalculation = function(){
  state.finance.loanAmount = safeNum(document.getElementById('loan-amount')?.value);
  state.finance.loanTAE = safeNum(document.getElementById('loan-tae')?.value);
  state.finance.loanTerm = Math.max(1, safeNum(document.getElementById('loan-term')?.value));

  if(state.finance.loanAmount <= 0){
    state.finance.annualInterest = 0;
    state.finance.totalFinancialCost = 0;
  } else {
    state.finance.annualInterest = state.finance.loanAmount * (state.finance.loanTAE/100);
    state.finance.totalFinancialCost = state.finance.annualInterest * state.finance.loanTerm;
  }
  const aic = document.getElementById('annual-interest-cost'); if(aic) aic.textContent = fmt(state.finance.annualInterest);
  const tfc = document.getElementById('total-financial-cost'); if(tfc) tfc.textContent = fmt(state.finance.totalFinancialCost);
  // trigger recompute
  updateAll();
};

/* =========================
   SALARY / PRICING CALCS
   ========================= */
function calcNetSalary(){
  const gross = safeNum(document.getElementById('grossSalary')?.value);
  const irpf = safeNum(document.getElementById('irpfRate')?.value);
  const ssEmp = gross * 0.0635;
  const annualNet = gross - (gross * irpf/100) - ssEmp;
  const monthly = annualNet / 14;
  const elNet = document.getElementById('netMonthlySalary'); if(elNet) elNet.textContent = fmt(monthly);
  const elSS = document.getElementById('ssDeduction'); if(elSS) elSS.textContent = fmt(ssEmp);
}

function calculatePricing(){
  const corporateTax = safeNum(document.getElementById('corporate-tax')?.value) || 25;
  const margin = safeNum(document.getElementById('target-profit-margin')?.value) || 20;
  const employees = Math.max(1, safeNum(document.getElementById('employee-count')?.value) || 1);
  const hoursEach = Math.max(1, safeNum(document.getElementById('annual-hours-per-employee')?.value) || 1600);
  const totalHours = employees * hoursEach;
  const totalCosts = Number((document.getElementById('total-operational-cost')?.textContent || '').replace(/[^0-9\.-]/g,'')) || 0;
  const suggested = totalHours>0 ? (totalCosts * (1 + margin/100)) / totalHours : 0;
  const elHours = document.getElementById('total-available-hours'); if(elHours) elHours.textContent = totalHours.toLocaleString();
  const elRate = document.getElementById('suggested-hourly-rate'); if(elRate) elRate.textContent = fmt(suggested);
  const elProfit = document.getElementById('expected-net-profit'); if(elProfit) elProfit.textContent = fmt(totalCosts * (margin/100));
  // also update summary fields used in right panel
  const requiredRevenue = totalCosts * (1 + margin/100);
  const reqEl = document.getElementById('required-annual-revenue');
  if(reqEl) reqEl.textContent = fmt(requiredRevenue);
}

/* =========================
   PANEL DERECHO (RESUMEN ESPECÍFICO)
   ========================= */
function updateRightSummary(){
  // ensure enhanced summary card exists; if not, create
  const aside = document.querySelector('aside.sidebar');
  if(!aside) return;
  let enhanced = document.getElementById('enhanced-summary');
  if(!enhanced){
    enhanced = document.createElement('div');
    enhanced.className = 'card';
    enhanced.id = 'enhanced-summary';
    enhanced.innerHTML = `
      <h4>Laburpen xehetuak</h4>
      <p id="summary-operational">Urteko gastu osoa: <strong id="summary-operational-val">€ 0.00</strong></p>
      <p id="summary-profit">Mozkin garbia: <strong id="summary-profit-val">€ 0.00</strong></p>
      <p id="summary-required">Fakturazio beharra: <strong id="summary-required-val">€ 0.00</strong></p>
      <p id="summary-finance">Finantzia behar: <strong id="summary-finance-val">€ 0.00</strong></p>
      <p id="summary-rate">Orduko prezioa gomendatua: <strong id="summary-rate-val">€ 0.00</strong></p>
    `;
    // insert before contact card
    const contactCard = aside.querySelector('.card:last-of-type');
    if(contactCard) aside.insertBefore(enhanced, contactCard);
    else aside.appendChild(enhanced);
  }

  // compute summary values
  const totalOperational = Number((document.getElementById('total-operational-cost')?.textContent||'').replace(/[^0-9\.-]/g,''))||0;
  const profit = Number((document.getElementById('expected-net-profit')?.textContent||'').replace(/[^0-9\.-]/g,''))||0;
  const required = Number((document.getElementById('required-annual-revenue')?.textContent||'').replace(/[^0-9\.-]/g,''))||0;
  const financeNeeded = Number((document.getElementById('total-finance-needed')?.textContent||'').replace(/[^0-9\.-]/g,''))||0;
  const suggestedRate = Number((document.getElementById('suggested-hourly-rate')?.textContent||'').replace(/[^0-9\.-]/g,''))||0;

  const set = (id,val)=>{ const el = document.getElementById(id); if(el) el.textContent = fmt(val); };
  set('summary-operational-val', totalOperational);
  set('summary-profit-val', profit);
  set('summary-required-val', required);
  set('summary-finance-val', financeNeeded);
  set('summary-rate-val', suggestedRate);

  // additionally show context-specific snippet
  // e.g., if current visible sheet is 'lokala', show local breakdown
  const visibleSheet = qsa('.panel').find(p=> p.style.display !== 'none' && !p.classList.contains('hidden'));
  const snippetEl = document.getElementById('lokal-summary');
  if(visibleSheet && visibleSheet.id === 'lokala-sheet' && snippetEl){
    const localAmort = Number((document.getElementById('total-local-amortization')?.textContent||'').replace(/[^0-9\.-]/g,''))||0;
    const localRec = Number((document.getElementById('total-local-recurring')?.textContent||'').replace(/[^0-9\.-]/g,''))||0;
    snippetEl.textContent = `Amortiz: ${fmt(localAmort)} · Errepik: ${fmt(localRec)}`;
  }
}

/* =========================
   PDF GENERATION
   ========================= */
async function generatePDFReport(){
  const overlay = document.getElementById('loading-overlay');
  if(overlay) overlay.style.display = 'flex';
  try{
    // prefer to capture the active panel content to produce compact PDF
    const activePanel = qsa('.panel').find(p => p.style.display !== 'none' && !p.classList.contains('hidden'));
    const node = activePanel || document.getElementById('main-sheet') || document.body;
    const canvas = await html2canvas(node, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p','pt','a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const imgHeight = canvas.height * pageWidth / canvas.width;
    doc.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight);
    // footer with contact and language
    const lang = localStorage.getItem('selectedLanguage') || 'eu';
    const footerText = (translations[lang] && translations[lang]['footer.note']) || fallbackTranslations[lang]['footer.note'];
    doc.setFontSize(9);
    doc.text(footerText, 40, doc.internal.pageSize.getHeight() - 30);
    doc.save('IDarte_Aurrekontua.pdf');
  }catch(err){
    console.error(err);
    alert('Errorea sortzean PDF: ' + (err.message || err));
  }finally{
    if(overlay) overlay.style.display = 'none';
  }
}

/* =========================
   INIT: PRELOAD SAMPLE DATA + BIND EVENTS
   ========================= */
function preloadSampleData(){
  // amortizables
  state.amortizables.lokala = [
    { id: uid('am'), name: 'Sarrera ekipamendua', cost: 3000, life: 5, category: 'lokala' }
  ];
  state.amortizables.garraioa = [
    { id: uid('am'), name: 'Kotxea', cost: 12000, life: 5, category: 'garraioa' }
  ];
  // recurrings
  state.recurrings.lokala = [
    { id: uid('r'), name: 'Alokairua (hilekoa)', payment_cost: 800, frequency: 12, category: 'lokala' },
    { id: uid('r'), name: 'Ura / Argia', payment_cost: 100, frequency: 12, category: 'lokala' }
  ];
  state.recurrings.ekoizpena = [
    { id: uid('r'), name: 'Materialak', payment_cost: 400, frequency: 12, category: 'ekoizpena' }
  ];
  state.recurrings.garraioa = [
    { id: uid('r'), name: 'Erregaia', payment_cost: 250, frequency: 12, category: 'garraioa' }
  ];
  state.recurrings.hazkuntza = [
    { id: uid('r'), name: 'Komunikazioa', payment_cost: 150, frequency: 12, category: 'hazkuntza' }
  ];
  // personnel
  state.personnel = [
    { id: uid('p'), role: 'Diseinatzaile', gross: 25000, employer_ss: 30 }
  ];
}

function bindGlobalInputs(){
  // language select
  const sel = document.getElementById('language-select');
  if(sel) sel.addEventListener('change', (e)=> applyTranslations(e.target.value));
  // finance inputs
  ['partner-capital-1','partner-capital-2','partner-capital-3'].forEach(id=>{
    const el = document.getElementById(id); if(el) el.addEventListener('input', updateFinanceStrategy);
  });
  ['loan-amount','loan-tae','loan-term'].forEach(id=>{
    const el = document.getElementById(id); if(el) el.addEventListener('input', updateLoanCalculation);
  });
  ['corporate-tax','target-profit-margin','employee-count','annual-hours-per-employee'].forEach(id=>{
    const el = document.getElementById(id); if(el) el.addEventListener('input', calculatePricing);
  });
  // salary calc
  const gross = document.getElementById('grossSalary'); if(gross) gross.addEventListener('input', calcNetSalary);
  const irpf = document.getElementById('irpfRate'); if(irpf) irpf.addEventListener('input', calcNetSalary);
  // download button
  const dl = document.getElementById('download-report-btn'); if(dl) dl.addEventListener('click', generatePDFReport);
}

async function init(){
  // load translations (try remote file; fallback to embedded)
  await loadTranslations(localStorage.getItem('selectedLanguage') || 'eu');
  // build panels if empty
  buildPanelsIfEmpty();
  // preload data
  preloadSampleData();
  // render tables
  renderAllTables();
  renderAllTables(); // call twice occasionally helps ensure DOM ids exist
  // compute initial sums
  updateAll();
  // bind inputs
  bindGlobalInputs();
  // init tabs behaviour
  initTabs();
  // set language select value
  const sel = document.getElementById('language-select'); if(sel) sel.value = localStorage.getItem('selectedLanguage') || 'eu';
}

// run init on load

/* =========================
   TABS BEHAVIOUR
   ========================= */
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
      // actualizar resumen contextual
      updateRightSummary();
    });
  });

  // mostrar primer panel por defecto
  tabs[0]?.classList.add('active');
  panels.forEach((p, i) => p.style.display = i === 0 ? 'block' : 'none');
}

/* =========================
   NAVEGACIÓN ENTRE PESTAÑAS
   ========================= */
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
      // Actualizar resumen de la pestaña
      if (typeof updateRightSummary === 'function') updateRightSummary();
    });
  });

  // Mostrar la primera pestaña por defecto
  tabs[0]?.classList.add('active');
  panels.forEach((p, i) => p.style.display = i === 0 ? 'block' : 'none');
}


window.addEventListener('load', init);

