/* ============================================================
   Papeles Resueltos — formulario de ejemplo (demo)
   Una solicitud de beneficios realista, con datos FICTICIOS.
   Cada celda apunta a una entrada del glosario (fid).
   ============================================================ */

window.DEMO_FORM = {
  title: "SOLICITUD DE BENEFICIOS",
  subtitle: "Formulario de ejemplo inspirado en solicitudes reales de inmigración y beneficios (sin número de formulario oficial).",
  foot: "Los datos de este formulario son ficticios. OMB No. 0000-0000 (ejemplo).",
  persona: "María González",
  cells: [
    // filas del "papel": cada fila es una lista de celdas
    [
      { fid: "last-name",  labelEs: "1. Apellido(s)", labelEn: "Last name",       value: "GONZÁLEZ" },
      { fid: "first-name", labelEs: "2. Primer nombre", labelEn: "First name",    value: "MARÍA" },
      { fid: "middle-name",labelEs: "3. Segundo nombre", labelEn: "Middle name",  value: "LUZ" }
    ],
    [
      { fid: "date-of-birth", labelEs: "4. Fecha de nacimiento", labelEn: "Date of birth", value: "04/12/1989" },
      { fid: "ssn",           labelEs: "5. Número de Seguro Social", labelEn: "SSN",        value: "•••-••-1234" }
    ],
    [
      { fid: "a-number", labelEs: "6. Número de registro de extranjero", labelEn: "A-Number", value: "A 098-765-432" }
    ],
    [
      { fid: "street", labelEs: "7. Dirección (calle y número)", labelEn: "Street address", value: "1520 N Maple Ave, Apt 3B" }
    ],
    [
      { fid: "city",  labelEs: "8. Ciudad",     labelEn: "City",  value: "Chicago" },
      { fid: "state", labelEs: "9. Estado",     labelEn: "State", value: "IL" },
      { fid: "zip",   labelEs: "10. Cód. postal", labelEn: "ZIP", value: "60614" }
    ],
    [
      { fid: "phone", labelEs: "11. Teléfono",  labelEn: "Phone", value: "(555) 214-8876" },
      { fid: "email", labelEs: "12. Correo electrónico", labelEn: "Email", value: "maria.gonzalez@example.com" }
    ],
    [
      {
        fid: "marital-status",
        labelEs: "13. Estado civil",
        labelEn: "Marital status",
        kind: "checks",
        value: "Casada",
        options: ["Soltero/a", "Casada", "Divorciado/a", "Viudo/a"]
      }
    ],
    [
      { fid: "citizenship", labelEs: "14. País de ciudadanía", labelEn: "Country of citizenship", value: "México" }
    ],
    [
      { fid: "arrival-date", labelEs: "15. Fecha de última llegada a EE. UU.", labelEn: "Date of last arrival", value: "03/22/2018" }
    ],
    [
      { fid: "immigration-status", labelEs: "16. Estatus migratorio actual", labelEn: "Current immigration status", value: "Residente permanente condicional" }
    ],
    [
      { fid: "signature", labelEs: "17. Firma", labelEn: "Signature", kind: "sig", value: "María G." },
      { fid: "date-signed", labelEs: "18. Fecha", labelEn: "Date", value: "08/05/2026" }
    ]
  ]
};

/** Busca la entrada del glosario por id. */
function glossaryById(id) {
  return window.GLOSSARY.find(function (f) { return f.id === id; }) || null;
}

/** Construye el DOM del "papel" (formulario de ejemplo) dentro de #demo-paper. */
function renderDemoPaper() {
  const wrap = document.getElementById("demo-paper");
  if (!wrap) return;

  wrap.innerHTML = "";

  const head = document.createElement("div");
  head.className = "paper-head";
  const h2 = document.createElement("h2");
  h2.textContent = window.DEMO_FORM.title;
  const sub = document.createElement("p");
  sub.textContent = window.DEMO_FORM.subtitle;
  head.appendChild(h2);
  head.appendChild(sub);
  wrap.appendChild(head);

  const hint = document.createElement("p");
  hint.className = "paper-tap-hint";
  hint.textContent = "👆 Toca cualquier número para entender ese campo";
  wrap.appendChild(hint);

  let num = 1;
  const cellRefs = []; // {cell, fid, field}

  window.DEMO_FORM.cells.forEach(function (rowCells) {
    const row = document.createElement("div");
    row.className = "paper-row" + (rowCells.length === 3 ? " cols-3" : rowCells.length === 4 ? " cols-4" : "");

    rowCells.forEach(function (c) {
      const field = glossaryById(c.fid);
      if (!field) return;

      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.fid = c.fid;
      cell.setAttribute("role", "button");
      cell.setAttribute("tabindex", "0");
      cell.setAttribute("aria-label", field.es);

      const label = document.createElement("span");
      label.className = "cell-label";
      label.innerHTML = c.labelEs + " <i>" + c.labelEn + "</i>";
      cell.appendChild(label);

      if (c.kind === "checks") {
        const checks = document.createElement("div");
        checks.className = "check-row";
        (c.options || []).forEach(function (opt) {
          const s = document.createElement("span");
          s.textContent = (opt === c.value ? "☑ " : "☐ ") + opt;
          if (opt === c.value) s.classList.add("checked");
          checks.appendChild(s);
        });
        cell.appendChild(checks);
      } else {
        const val = document.createElement("span");
        val.className = "cell-value" + (c.kind === "sig" ? " sig" : "");
        val.textContent = c.value || "";
        cell.appendChild(val);
      }

      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = String(num);
      cell.appendChild(badge);

      // Los eventos (click/teclado) se manejan por delegación en app.js
      row.appendChild(cell);
      cellRefs.push({ cell: cell, fid: c.fid, data: c });
      num++;
    });

    wrap.appendChild(row);
  });

  const foot = document.createElement("p");
  foot.className = "paper-foot";
  foot.textContent = window.DEMO_FORM.foot;
  wrap.appendChild(foot);

  // se guarda para el recorrido guiado
  window.__demoCellRefs = cellRefs;
}

/** Construye la lista acordeón de los 18 campos (debajo del papel). */
function renderFieldList() {
  const list = document.getElementById("fieldlist-items");
  if (!list) return;
  list.innerHTML = "";

  let num = 1;
  window.DEMO_FORM.cells.forEach(function (rowCells) {
    rowCells.forEach(function (c) {
      const field = glossaryById(c.fid);
      if (!field) return;

      const item = document.createElement("details");
      item.className = "field-item";
      item.innerHTML = "";

      const summary = document.createElement("summary");
      const n = document.createElement("span");
      n.className = "f-num";
      n.textContent = String(num);
      const es = document.createElement("span");
      es.textContent = field.es;
      const en = document.createElement("span");
      en.className = "f-en";
      en.textContent = field.en;
      const chev = document.createElement("span");
      chev.className = "chev";
      chev.textContent = "›";
      summary.appendChild(n);
      summary.appendChild(es);
      summary.appendChild(en);
      summary.appendChild(chev);
      item.appendChild(summary);

      const body = document.createElement("div");
      body.className = "f-body";
      const mk = function (t, txt) {
        const h = document.createElement("h4");
        h.textContent = t;
        const p = document.createElement("p");
        p.textContent = txt;
        body.appendChild(h);
        body.appendChild(p);
      };
      mk("Qué significa", field.explain);
      mk("Por qué importa", field.why);
      mk("Consejo", field.tip);
      item.appendChild(body);

      list.appendChild(item);
      num++;
    });
  });
}
