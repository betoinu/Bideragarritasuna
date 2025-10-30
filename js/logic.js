/* === IDARTE PRESUPUESTUAK === */
/* Lógica de interacción, cálculos, idioma y PDF */

// Carga inicial
window.addEventListener("load", () => {
  initTabs();
  const savedLang = localStorage.getItem("selectedLanguage") || "eu";
  changeLanguage(savedLang);
});

/* =========================
   🧭 NAVEGACIÓN ENTRE TABS
   ========================= */
function initTabs() {
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      panels.forEach((p) => (p.style.display = "none"));

      tab.classList.add("active");
      const target = tab.getAttribute("data-target");
      document.getElementById(target).style.display = "block";
    });
  });
}

/* =========================
   🌐 TRADUCCIÓN DINÁMICA
   ========================= */
async function changeLanguage(lang) {
  try {
    const response = await fetch(`lang/lang.json`);
    const translations = await response.json();
    const text = translations[lang];

    if (!text) return console.warn("Idioma no encontrado:", lang);

    // Aplica traducción
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      if (text[key]) el.textContent = text[key];
    });

    localStorage.setItem("selectedLanguage", lang);
    document.getElementById("language-select").value = lang;
  } catch (e) {
    console.error("Error al cargar traducción:", e);
  }
}

/* =========================
   📊 CÁLCULOS SIMPLES
   ========================= */
function calculatePricing() {
  const tax = parseFloat(document.getElementById("corporate-tax").value) || 0;
  const margin = parseFloat(document.getElementById("target-profit-margin").value) || 0;
  const employees = parseFloat(document.getElementById("employee-count").value) || 1;
  const annualHours = parseFloat(document.getElementById("annual-hours-per-employee").value) || 1600;

  const totalHours = employees * annualHours;
  const cost = 40000 * employees; // Ejemplo base
  const suggestedRate = (cost * (1 + margin / 100)) / totalHours;
  const netProfit = (cost * margin) / 100 / (1 + tax / 100);

  document.getElementById("total-available-hours").textContent = totalHours.toFixed(0);
  document.getElementById("suggested-hourly-rate").textContent = `€ ${suggestedRate.toFixed(2)}`;
  document.getElementById("expected-net-profit").textContent = `€ ${netProfit.toFixed(2)}`;
}

/* =========================
   💰 FUNCIONES AUXILIARES
   ========================= */
function addAmortizableItem(section) {
  alert(`(+) Añadir elemento amortizable a ${section}`);
}
function addRecurringItem(section) {
  alert(`(+) Añadir gasto recurrente a ${section}`);
}
function addPersonnel() {
  alert("(+) Añadir personal");
}

/* =========================
   🧾 GENERAR PDF
   ========================= */
async function generatePDFReport() {
  const overlay = document.getElementById("loading-overlay");
  overlay.style.display = "flex";

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "pt", "a4");
  const content = document.querySelector(".wrap");

  const canvas = await html2canvas(content, {
    scale: 2,
    backgroundColor: "#ffffff"
  });

  const imgData = canvas.toDataURL("image/png");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = (canvas.height * pageWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
  pdf.save("idarte_aurrekontua.pdf");

  overlay.style.display = "none";
}
