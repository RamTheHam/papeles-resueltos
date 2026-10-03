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
    ocrRunning: false,
    ocrJob: null,
    resultsAvailable: false,
    fileVersion: 0,
    sheetOpener: null
  };

  const $ = function (sel) { return document.querySelector(sel); };
  const $$ = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };

  /* ---------- Navegación ---------- */
  function showScreen(name, fromHistory) {
    if (name === "results" && fromHistory && !state.ocrRunning && !state.resultsAvailable) {
      name = "capture";
      history.replaceState({ screen: name }, "");
    }
    if (name !== "results") cancelOCR();
    if (name === "home" || name === "demo") clearCapture();
    state.screen = name;
    stopTour();
    closeSheet(false);
    $$(".screen").forEach(function (s) { s.hidden = true; });
    const el = document.getElementById("screen-" + name);
    if (el) el.hidden = false;
    $("#btn-back").hidden = (name === "home");
    if (!fromHistory && history.state && history.state.screen !== name) {
      history.pushState({ screen: name }, "");
    }
    window.scrollTo({ top: 0, behavior: "auto" });
    const heading = el && el.querySelector("h1");
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
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

    const wasHidden = $("#sheet").hidden;
    if (wasHidden) state.sheetOpener = document.activeElement;
    $("#sheet").hidden = false;
    $("#sheet-overlay").hidden = false;
    document.body.style.overflow = "hidden";
    $(".app").inert = true;
    if (wasHidden) $("#sheet-close").focus({ preventScroll: true });
  }

  function closeSheet(restoreFocus) {
    const wasOpen = !$("#sheet").hidden;
    $("#sheet").hidden = true;
    $("#sheet-overlay").hidden = true;
    $(".app").inert = false;
    document.body.style.overflow = "";
    if (wasOpen && restoreFocus !== false && state.sheetOpener && state.sheetOpener.isConnected) {
      state.sheetOpener.focus({ preventScroll: true });
    }
    state.sheetOpener = null;
  }

  function dismissSheet() { stopTour(); closeSheet(); }

  /* ---------- Recorrido guiado (demo) ---------- */
  function startTour() {
    const refs = window.__demoCellRefs || [];
    if (!refs.length || state.tourActive) return;

    state.tourActive = true;
    state.tourIndex = -1;
    $("#sheet-tour").hidden = false;
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
    $("#sheet-tour-count").textContent = "Campo " + (state.tourIndex + 1) + " de " + refs.length;
    $("#sheet-tour-prev").disabled = state.tourIndex === 0;
    $("#sheet-tour-next").textContent = state.tourIndex === refs.length - 1 ? "Terminar recorrido" : "Siguiente campo";
    openSheetForField(current.fid, "demo", current.data, true); // keepTour: no se auto-detiene

    state.tourTimer = setTimeout(stepTour, 3200);
  }

  function stopTour() {
    state.tourActive = false;
    const focusInTour = $("#sheet-tour").contains(document.activeElement);
    $("#sheet-tour").hidden = true;
    if (focusInTour && !$("#sheet").hidden) $("#sheet-close").focus({ preventScroll: true });
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
  function clearCapture() {
    state.fileVersion++;
    state.currentFile = null;
    state.lastOcrText = "";
    state.resultsAvailable = false;
    $("#capture-preview").removeAttribute("src");
    $("#capture-preview-wrap").hidden = true;
    $("#matched-list").replaceChildren();
    $("#unmatched-lines").textContent = "";
    $("#sheet-note").textContent = "";
    $("#summary-text").textContent = "";
  }

  function handleFile(file) {
    if (!file) return; // Canceling the system picker leaves the current photo alone.
    clearCapture();
    if (!/^image\//.test(file.type)) {
      showToast("Elige una foto (JPG, PNG o similar).");
      return;
    }
    const version = state.fileVersion;
    const reader = new FileReader();
    reader.onerror = function () { showToast("No pudimos abrir esa foto. Elige otra imagen."); };
    reader.onload = function (e) {
      if (version !== state.fileVersion || state.screen !== "capture") return;
      const img = $("#capture-preview");
      img.onload = function () {
        if (version !== state.fileVersion) return;
        state.currentFile = file;
        $("#capture-preview-wrap").hidden = false;
        img.scrollIntoView({ behavior: "smooth", block: "nearest" });
      };
      img.onerror = function () {
        if (version !== state.fileVersion) return;
        clearCapture();
        showToast("No pudimos abrir esa foto. Elige otra imagen.");
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  /* ---------- OCR local con Tesseract.js ---------- */
  function setOCRProgress(status, progress) {
    $("#progress-status").textContent = status + (progress != null ? " — " + Math.round(progress * 100) + "%" : "");
    $("#progress-fill").style.width = Math.max(4, Math.round((progress == null ? 0 : progress) * 100)) + "%";
  }

  async function releaseWorker(job) {
    if (!job.worker || job.terminated) return;
    job.terminated = true;
    try { await job.worker.terminate(); } catch (_) { /* A cancelled worker may already be stopped. */ }
  }

  function cancelOCR() {
    const job = state.ocrJob;
    if (!job) return;
    job.cancelled = true;
    state.ocrJob = null;
    state.ocrRunning = false;
    void releaseWorker(job);
  }

  function renderOCRError(message) {
    state.resultsAvailable = true;
    $("#results-title").textContent = "No pudimos leer tu formulario";
    $("#results-sub").textContent = "Puedes elegir otra foto o probar la demo.";
    $("#ocr-progress").hidden = true;
    $("#ocr-result").hidden = false;
    $("#summary-card").hidden = false;
    $("#summary-text").textContent = message;
    $("#matched-title").textContent = "";
    $("#matched-list").replaceChildren();
    $("#unmatched-card").hidden = true;
  }

  async function runOCR(file) {
    if (state.ocrRunning) return;
    state.ocrRunning = true;
    state.resultsAvailable = false;
    const job = { worker: null, cancelled: false, terminated: false };
    state.ocrJob = job;
    showScreen("results");
    $("#results-title").textContent = "Leyendo tu formulario…";
    $("#results-sub").textContent = "Esto toma unos segundos. Puedes cancelar la lectura.";
    $("#ocr-progress").hidden = false;
    $("#ocr-result").hidden = true;
    setOCRProgress("Preparando lector…", 0.05);
    try {
      if (!window.Tesseract) {
        renderOCRError("El motor de lectura (Tesseract.js) no se pudo cargar desde la CDN. Revisa tu conexión a internet o prueba con la demo.");
        return;
      }
      job.worker = await Tesseract.createWorker(["eng", "spa"], 1, {
        logger: function (m) {
          if (job.cancelled || !m || !m.status) return;
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
      if (job.cancelled) return;
      setOCRProgress("Leyendo tu formulario…", 0.6);
      const { data } = await job.worker.recognize(file);
      if (job.cancelled) return;
      state.lastOcrText = data.text || "";
      renderResults(state.lastOcrText);
    } catch (_) {
      if (!job.cancelled) renderOCRError("No pudimos leer esa imagen. Prueba con mejor luz, acercando la cámara y enderezando el papel — o usa la demo.");
    } finally {
      await releaseWorker(job);
      if (state.ocrJob === job) {
        state.ocrJob = null;
        state.ocrRunning = false;
      }
    }
  }

  function renderResults(text) {
    state.resultsAvailable = true;
    $("#ocr-progress").hidden = true;
    $("#ocr-result").hidden = false;

    const matched = matchFields(text);
    $("#results-title").textContent = "Tu formulario, explicado";
    $("#results-sub").textContent = text.trim() ? "Revisa los campos y el texto que todavía no reconocemos." : "No se detectó texto. Prueba con una foto más clara.";

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

        const detail = document.createElement("button");
        detail.className = "btn btn-ghost";
        detail.textContent = "Ver explicación y consejo";
        detail.setAttribute("aria-label", "Explicar " + f.es);
        detail.addEventListener("click", function () { openSheetForField(f.id, "photo"); });
        item.appendChild(detail);
        list.appendChild(item);
      });
    }

    // Texto no reconocido
    const um = unmatchedLines(text, matched);
    $("#unmatched-card").hidden = um.length === 0;
    if (um.length) {
      $("#unmatched-intro").textContent =
        "Estas líneas de tu foto no están en nuestro glosario todavía (la versión con IA las leerá todas). No las borres de tu original: algunas pueden ser importantes.";
      $("#unmatched-lines").textContent = um.join("\n");
    }

    window.scrollTo({ top: 0, behavior: "auto" });
  }

  /* ---------- Eventos ---------- */
  function bindEvents() {
    // Navegación
    $("#btn-home").addEventListener("click", function () { showScreen("home"); });
    $("#btn-back").addEventListener("click", function () { history.back(); });
    window.addEventListener("popstate", function (e) { showScreen(e.state && e.state.screen || "home", true); });
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
      $("#btn-fieldlist").textContent = fl.hidden ? "Ver lista de campos" : "Ocultar lista de campos";
      $("#btn-fieldlist").setAttribute("aria-expanded", String(!fl.hidden));
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
      clearCapture();
      showScreen("capture");
    });

    // Hoja inferior
    $("#btn-cancel-ocr").addEventListener("click", function () { cancelOCR(); showScreen("capture"); });
    $("#sheet-close").addEventListener("click", dismissSheet);
    $("#sheet-overlay").addEventListener("click", dismissSheet);
    $("#sheet-tour-stop").addEventListener("click", dismissSheet);
    $("#sheet-tour-next").addEventListener("click", function () {
      clearTimeout(state.tourTimer);
      if (state.tourIndex === window.__demoCellRefs.length - 1) dismissSheet();
      else stepTour();
    });
    $("#sheet-tour-prev").addEventListener("click", function () {
      clearTimeout(state.tourTimer);
      state.tourIndex -= 2;
      stepTour();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { dismissSheet(); }
      if (e.key === "Tab" && !$("#sheet").hidden) {
        const controls = $$("#sheet button").filter(function (el) { return !el.disabled && el.getClientRects().length; });
        const first = controls[0], last = controls[controls.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
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
    history.replaceState({ screen: "home" }, "");
    showScreen("home", true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
