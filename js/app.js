/* ============================================================
   Papeles Resueltos — app.js (MVP demo)
   Navegación, hoja de explicación, recorrido guiado y OCR local
   con Tesseract.js. Sin servidores, sin API keys.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Estado ---------- */
  const state = {
    screen: "home",
    tourActive: false,
    tourTimer: null,
    tourIndex: -1,
    currentFile: null,
    ocrRunning: false
  };

  const $ = function (sel) { return document.querySelector(sel); };
  const $$ = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };

  /* ---------- Navegación ---------- */
  function showScreen(name) {
    state.screen = name;
    stopTour();
    closeSheet();
    $$(".screen").forEach(function (s) { s.hidden = true; });
    const el = document.getElementById("screen-" + name);
    if (el) el.hidden = false;
    $("#btn-back").hidden = (name === "home");
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  /* ---------- Hoja inferior ---------- */
  function openSheetForField(fid, source, cellData, keepTour) {
    const field = glossaryById(fid);
    if (!field) return;

    if (!keepTour) stopTour();

    $("#sheet-tag").textContent = "Campo " + (cellData && cellData.labelEs ? cellData.labelEs.replace(/^\d+\.\s*/, "") : field.en);
    $("#sheet-en").textContent = field.en;
    $("#sheet-es").textContent = field.es;
    $("#sheet-explain").textContent = field.explain;
    $("#sheet-why").textContent = field.why;
    $("#sheet-tip").textContent = field.tip;

    const note = $("#sheet-note");
    if (source === "demo") {
      const val = cellData && cellData.value ? cellData.value : "";
      note.textContent = "En el formulario de ejemplo este campo dice: “" + val + "”. Los datos del ejemplo son ficticios.";
    } else {
      const snip = snippetForField(state.lastOcrText || "", field);
      note.textContent = snip
        ? "Lo vimos así en tu foto: “" + snip + "”"
        : "Este campo aparece en el glosario; la explicación es la misma para cualquier formulario.";
    }

    $("#sheet").hidden = false;
    $("#sheet-overlay").hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeSheet() {
    $("#sheet").hidden = true;
    $("#sheet-overlay").hidden = true;
    document.body.style.overflow = "";
  }

  /* ---------- Recorrido guiado (demo) ---------- */
  function startTour() {
    const refs = window.__demoCellRefs || [];
    if (!refs.length || state.tourActive) return;

    state.tourActive = true;
    state.tourIndex = -1;
    $("#btn-tour").innerHTML = '<span class="btn-ico">⏸</span> Detener recorrido';
    stepTour();
  }

  function stepTour() {
    if (!state.tourActive) return;
    const refs = window.__demoCellRefs || [];
    state.tourIndex++;
    if (state.tourIndex >= refs.length) { stopTour(); return; }

    refs.forEach(function (r, i) { r.cell.classList.toggle("is-live", i === state.tourIndex); });
    const current = refs[state.tourIndex];
    current.cell.scrollIntoView({ behavior: "smooth", block: "center" });
    openSheetForField(current.fid, "demo", current.data, true); // keepTour: no se auto-detiene

    state.tourTimer = setTimeout(stepTour, 3200);
  }

  function stopTour() {
    state.tourActive = false;
    if (state.tourTimer) { clearTimeout(state.tourTimer); state.tourTimer = null; }
    state.tourIndex = -1;
    if (window.__demoCellRefs) {
      window.__demoCellRefs.forEach(function (r) { r.cell.classList.remove("is-live"); });
    }
    const btn = $("#btn-tour");
    if (btn) btn.innerHTML = '<span class="btn-ico">▶</span> Explicar todo (recorrido)';
  }

  /* ---------- Toast ---------- */
  let toastTimer = null;
  function showToast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 4000);
  }

  /* ---------- Captura de imagen ---------- */
  function handleFile(file) {
    if (!file || !/^image\//.test(file.type)) {
      showToast("Elige una foto (JPG, PNG o similar).");
      return;
    }
    state.currentFile = file;
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = $("#capture-preview");
      img.src = e.target.result;
      $("#capture-preview-wrap").hidden = false;
      img.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };
    reader.readAsDataURL(file);
  }

  /* ---------- OCR local con Tesseract.js ---------- */
  function setOCRProgress(status, progress) {
    $("#progress-status").textContent = status + (progress != null ? " — " + Math.round(progress * 100) + "%" : "");
    $("#progress-fill").style.width = Math.max(4, Math.round((progress == null ? 0 : progress) * 100)) + "%";
  }

  async function runOCR(file) {
    if (state.ocrRunning) return;
    state.ocrRunning = true;

    if (!window.Tesseract) {
      showScreen("results");
      $("#ocr-progress").hidden = true;
      $("#ocr-result").hidden = false;
      $("#summary-card").hidden = false;
      $("#summary-text").textContent =
        "El motor de lectura (Tesseract.js) no se pudo cargar desde la CDN. Revisa tu conexión a internet o prueba con la demo.";
      $("#matched-title").textContent = "";
      $("#matched-list").innerHTML = "";
      $("#unmatched-card").hidden = true;
      state.ocrRunning = false;
      return;
    }

    showScreen("results");
    $("#ocr-progress").hidden = false;
    $("#ocr-result").hidden = true;
    setOCRProgress("Preparando lector…", 0.05);

    try {
      const worker = await Tesseract.createWorker(["eng", "spa"], 1, {
        logger: function (m) {
          if (!m || !m.status) return;
          const labels = {
            "loading tesseract core": "Cargando el motor de lectura",
            "initializing tesseract": "Inicializando lector",
            "loading language traineddata": "Cargando idiomas (inglés + español)",
            "initializing api": "Preparando análisis",
            "recognizing text": "Leyendo tu formulario"
          };
          setOCRProgress(labels[m.status] || m.status, m.progress);
        }
      });

      setOCRProgress("Leyendo tu formulario…", 0.6);
      const { data } = await worker.recognize(file);
      await worker.terminate();

      state.lastOcrText = data.text || "";
      renderResults(state.lastOcrText);
    } catch (err) {
      console.error("OCR error:", err);
      $("#ocr-progress").hidden = true;
      $("#ocr-result").hidden = false;
      $("#summary-card").hidden = false;
      $("#summary-text").textContent =
        "No pudimos leer esa imagen. Prueba con mejor luz, acercando la cámara y enderezando el papel — o usa la demo.";
      $("#matched-title").textContent = "";
      $("#matched-list").innerHTML = "";
      $("#unmatched-card").hidden = true;
    } finally {
      state.ocrRunning = false;
    }
  }

  function renderResults(text) {
    $("#ocr-progress").hidden = true;
    $("#ocr-result").hidden = false;

    const matched = matchFields(text);
    const matchedIds = matched.map(function (f) { return f.id; });

    // Resumen
    $("#summary-card").hidden = false;
    $("#summary-text").textContent = matched.length > 0
      ? "Listo ✓ Encontramos " + matched.length + " campo" + (matched.length === 1 ? "" : "s") +
        " que podemos explicarte (" + matched.length + " de " + window.GLOSSARY.length + " del glosario)."
      : "No encontramos campos de nuestro glosario en el texto de la foto.";

    // Campos reconocidos
    $("#matched-title").textContent = matched.length > 0
      ? "Campos que reconocemos"
      : "¿Qué sigue?";
    const list = $("#matched-list");
    list.innerHTML = "";

    if (matched.length === 0) {
      const empty = document.createElement("div");
      empty.className = "card note-card";
      empty.innerHTML =
        "<p class='note-title'>No es tu culpa — es el MVP</p>" +
        "<p>Esta demo solo reconoce los campos de un glosario fijo. Si la foto no tiene buena luz, el lector tampoco ayuda. " +
        "La versión con IA leerá cualquier formulario completo.</p>";
      list.appendChild(empty);
    } else {
      matched.forEach(function (f) {
        const item = document.createElement("div");
        item.className = "match-item";

        const head = document.createElement("div");
        head.className = "m-head";
        const es = document.createElement("span");
        es.className = "m-es";
        es.textContent = f.es;
        const en = document.createElement("span");
        en.className = "m-en";
        en.textContent = f.en;
        head.appendChild(es);
        head.appendChild(en);
        item.appendChild(head);

        const snip = snippetForField(text, f);
        if (snip) {
          const s = document.createElement("span");
          s.className = "m-snip";
          s.textContent = "Lo vimos: “" + snip + "”";
          item.appendChild(s);
        }

        const ex = document.createElement("p");
        ex.className = "m-explain";
        ex.textContent = f.explain;
        item.appendChild(ex);

        const why = document.createElement("p");
        why.className = "m-why";
        why.innerHTML = "<b>Por qué importa:</b> " + f.why;
        item.appendChild(why);

        list.appendChild(item);
      });
    }

    // Texto no reconocido
    const um = unmatchedLines(text, matched);
    $("#unmatched-card").hidden = um.length === 0;
    if (um.length) {
      $("#unmatched-intro").textContent =
        "Estas líneas de tu foto no están en nuestro glosario todavía (la versión con IA las leerá todas). No las borres de tu original: algunas pueden ser importantes.";
      $("#unmatched-lines").textContent = um.slice(0, 14).join("\n");
    }

    window.scrollTo({ top: 0, behavior: "auto" });
  }

  /* ---------- Eventos ---------- */
  function bindEvents() {
    // Navegación
    $("#btn-home").addEventListener("click", function () { showScreen("home"); });
    $("#btn-back").addEventListener("click", function () { showScreen("home"); });
    $("#btn-demo").addEventListener("click", function () { showScreen("demo"); });
    $("#btn-demo-2").addEventListener("click", function () { showScreen("demo"); });
    $("#btn-demo-3").addEventListener("click", function () { showScreen("demo"); });
    $("#btn-capture").addEventListener("click", function () { showScreen("capture"); });

    // Demo
    $("#btn-tour").addEventListener("click", function () {
      if (state.tourActive) { stopTour(); } else { startTour(); }
    });
    $("#btn-fieldlist").addEventListener("click", function () {
      const fl = $("#fieldlist");
      fl.hidden = !fl.hidden;
      if (!fl.hidden) fl.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    // Captura
    $("#btn-camera").addEventListener("click", function () { $("#file-camera").click(); });
    $("#btn-gallery").addEventListener("click", function () { $("#file-gallery").click(); });
    $("#file-camera").addEventListener("change", function (e) {
      if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
      e.target.value = "";
    });
    $("#file-gallery").addEventListener("change", function (e) {
      if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
      e.target.value = "";
    });
    $("#btn-read").addEventListener("click", function () {
      if (state.currentFile) runOCR(state.currentFile);
    });
    $("#btn-again").addEventListener("click", function () {
      state.currentFile = null;
      $("#capture-preview").removeAttribute("src");
      $("#capture-preview-wrap").hidden = true;
      showScreen("capture");
    });

    // Hoja inferior
    $("#sheet-close").addEventListener("click", closeSheet);
    $("#sheet-overlay").addEventListener("click", closeSheet);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeSheet(); stopTour(); }
    });

    // Delegación: tocar una celda del formulario de ejemplo abre su explicación
    document.addEventListener("click", function (e) {
      const cell = e.target.closest(".cell");
      if (!cell) return;
      const fid = cell.dataset.fid;
      const ref = (window.__demoCellRefs || []).find(function (r) { return r.cell === cell; });
      openSheetForField(fid, "demo", ref ? ref.data : null);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      const cell = e.target.closest(".cell");
      if (!cell) return;
      e.preventDefault();
      const fid = cell.dataset.fid;
      const ref = (window.__demoCellRefs || []).find(function (r) { return r.cell === cell; });
      openSheetForField(fid, "demo", ref ? ref.data : null);
    });
  }

  /* ---------- Arranque ---------- */
  function init() {
    renderDemoPaper();
    renderFieldList();
    bindEvents();
    showScreen("home");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
