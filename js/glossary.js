/* ============================================================
   Papeles Resueltos — glosario bilingüe de campos
   Cada entrada: etiquetas que buscamos en el texto (EN + ES),
   nombre en inglés, nombre en español, explicación en español
   sencillo, por qué importa, y un consejo.
   ============================================================ */

window.GLOSSARY = [
  {
    id: "full-name",
    en: "Full legal name",
    es: "Nombre legal completo",
    labels: ["full legal name", "full name", "nombre legal completo", "nombre completo", "legal name", "name of applicant"],
    explain: "Tu nombre completo, tal como aparece en tu documento oficial: apellido(s) + nombre(s).",
    why: "El gobierno te identifica por este nombre exacto. Si no coincide con tu pasaporte o acta, el trámite se retrasa o se rechaza.",
    tip: "Escríbelo exactamente como está en tu documento, aunque ahí esté mal escrito o incompleto."
  },
  {
    id: "last-name",
    en: "Last name / Surname",
    es: "Apellido(s)",
    labels: ["last name", "last name(s)", "surname", "family name", "apellido", "apellidos", "apellido paterno", "apellido materno"],
    explain: "La parte de tu nombre que compartes con tu familia. En español normalmente es el apellido del papá y después el de la mamá.",
    why: "Es la primera forma en que las agencias te identifican y ordenan tus papeles. Debe coincidir con tus documentos oficiales.",
    tip: "Si tienes dos apellidos, escríbelos en el orden en que aparecen en tu pasaporte."
  },
  {
    id: "first-name",
    en: "First name / Given name",
    es: "Primer nombre",
    labels: ["first name", "given name", "primer nombre", "nombre de pila", "first/given name"],
    explain: "Tu nombre propio, el que te pusieron al nacer (por ejemplo, María).",
    why: "Sirve para confirmar tu identidad junto con tu apellido y tu fecha de nacimiento.",
    tip: "Si tienes dos nombres (María Luz), revisa si el formulario pide el segundo en una casilla aparte."
  },
  {
    id: "middle-name",
    en: "Middle name / Initial",
    es: "Segundo nombre / Inicial",
    labels: ["middle name", "middle initial", "second name", "segundo nombre", "segunda inicial", "initial"],
    explain: "El segundo nombre, o solo su inicial. No todos lo tienen; si no tienes, deja la casilla vacía o escribe N/A.",
    why: "Ayuda a distinguir personas con el mismo nombre y apellido.",
    tip: "Si no tienes segundo nombre, no inventes uno: deja la casilla en blanco o escribe N/A."
  },
  {
    id: "date-of-birth",
    en: "Date of birth",
    es: "Fecha de nacimiento",
    labels: ["date of birth", "birth date", "dob", "fecha de nacimiento", "fecha de nac.", "nacimiento", "born on", "born"],
    explain: "El día en que naciste: día, mes y año.",
    why: "Es uno de los tres datos que el gobierno usa para verificar quién eres (junto con nombre y número de documento). Un error aquí puede rechazar todo el trámite.",
    tip: "Revísala dos veces contra tu acta de nacimiento o pasaporte. En EE. UU. se escribe mes/día/año (MM/DD/AAAA)."
  },
  {
    id: "ssn",
    en: "Social Security Number (SSN)",
    es: "Número de Seguro Social",
    labels: ["social security number", "social security no.", "social security #", "ssn", "ss #", "no. de seguro social", "numero de seguro social", "número de seguro social", "seguro social"],
    explain: "El número de 9 dígitos que te asigna el gobierno de EE. UU. (formato 123-45-6789).",
    why: "Se usa para pagar impuestos, trabajar legalmente y recibir beneficios. Si no lo tienes, no lo inventes: pregunta antes.",
    tip: "En una copia, cúbrelo parcialmente si no es indispensable para el trámite."
  },
  {
    id: "a-number",
    en: "Alien Registration Number (A-Number)",
    es: "Número de registro de extranjero (A-Number)",
    labels: ["alien registration number", "alien registration no.", "a-number", "a number", "numero de registro de extranjero", "número de registro de extranjero", "registro de extranjero", "alien no."],
    explain: "El número que el gobierno de EE. UU. usa para tus expedientes de inmigración. Empieza con una A, por ejemplo A 098-765-432.",
    why: "Cada persona con un trámite de inmigración tiene uno. Es como tu 'número de cliente' con inmigración.",
    tip: "Está en tus papeles anteriores (notificaciones, permisos, tarjeta). Búscalo antes de llenar el formulario."
  },
  {
    id: "street",
    en: "Street address",
    es: "Dirección (calle y número)",
    labels: ["street address", "street", "address", "address line", "calle", "dirección", "direccion", "domicilio", "residence", "mailing address", "apartment", "apt", "unit"],
    explain: "Dónde vives o dónde quieres recibir correo: número de casa, nombre de la calle y apartamento si aplica.",
    why: "Ahí te llegan las notificaciones oficiales. Si se pierde una, puedes perder fechas importantes.",
    tip: "Escribe siempre el número de apartamento (Apt 3B). El correo sin apartamento puede no llegar."
  },
  {
    id: "city",
    en: "City",
    es: "Ciudad",
    labels: ["city", "ciudad", "town"],
    explain: "La ciudad o pueblo donde vives (o donde está tu dirección).",
    why: "Parte de tu dirección oficial; la agencia la usa para ubicarte y para impuestos.",
    tip: "Escribe la ciudad que corresponde oficialmente a tu código postal."
  },
  {
    id: "state",
    en: "State",
    es: "Estado",
    labels: ["state", "estado", "state/province"],
    explain: "El estado de EE. UU. donde vives, normalmente con sus dos letras (por ejemplo, IL por Illinois).",
    why: "Muchos trámites dependen del estado donde resides.",
    tip: "Usa la abreviatura de dos letras: IL, TX, CA, NY…"
  },
  {
    id: "zip",
    en: "ZIP code",
    es: "Código postal",
    labels: ["zip code", "zip", "postal code", "codigo postal", "código postal"],
    explain: "El código de 5 dígitos (o 9 con guion) del área donde vives.",
    why: "Acelera el correo y confirma tu dirección. Un código equivocado puede retrasar tus notificaciones.",
    tip: "Búscalo en Google Maps o en la página de USPS si no lo recuerdas."
  },
  {
    id: "phone",
    en: "Phone number",
    es: "Teléfono",
    labels: ["phone number", "telephone", "telephone number", "phone", "tel.", "tel", "telefono", "teléfono", "contact number", "daytime phone", "celular", "cell phone", "mobile"],
    explain: "El número donde pueden llamarte o mandarte mensajes de texto.",
    why: "Las agencias avisan por teléfono si falta un documento o hay una cita. Un número mal escrito = notificaciones perdidas.",
    tip: "Revisa el número dígito por dígito y anota si es de casa, celular o trabajo."
  },
  {
    id: "email",
    en: "Email address",
    es: "Correo electrónico",
    labels: ["email", "e-mail", "email address", "correo electronico", "correo electrónico", "correo", "electronic mail"],
    explain: "Tu dirección de correo electrónico, la que revisas con frecuencia.",
    why: "Muchas agencias ya avisan por correo electrónico y ahí mandan copias de tus documentos.",
    tip: "Revisa que no tenga errores: un punto o guion mal puesto y no te llega nada."
  },
  {
    id: "marital-status",
    en: "Marital status",
    es: "Estado civil",
    labels: ["marital status", "civil status", "estado civil", "married", "single", "soltero", "casado", "divorced", "widowed", "viudo", "separated"],
    explain: "Si estás soltero(a), casado(a), divorciado(a), separado(a) o viudo(a).",
    why: "Muchos beneficios y trámites de inmigración cambian según tu estado civil (por ejemplo, las peticiones de familia).",
    tip: "Sé honesto(a): declarar un estado civil falso es un delito con consecuencias graves."
  },
  {
    id: "citizenship",
    en: "Country of citizenship",
    es: "País de ciudadanía",
    labels: ["country of citizenship", "citizenship", "country of nationality", "nationality", "pais de ciudadania", "país de ciudadanía", "pais de nacionalidad", "ciudadania", "ciudadanía"],
    explain: "El país que te considera ciudadano (por nacimiento o por naturalización).",
    why: "Define qué trámites puedes hacer y con qué documentos te van a pedir.",
    tip: "Si tienes dos ciudadanías, revisa si el formulario te deja anotar las dos o pide la principal."
  },
  {
    id: "arrival-date",
    en: "Date of last arrival",
    es: "Fecha de última llegada a EE. UU.",
    labels: ["date of last arrival", "last arrival", "date of arrival", "arrival date", "fecha de ultima llegada", "fecha de última llegada", "fecha de llegada", "fecha de entrada", "date of entry", "port of entry", "entry date"],
    explain: "El día en que entraste por última vez a Estados Unidos.",
    why: "Con esa fecha el gobierno calcula cuánto tiempo llevas en el país, lo que decide muchos beneficios y fechas límite.",
    tip: "Búscala en el sello de tu pasaporte o en tu historial de viajes (I-94 en cbp.gov)."
  },
  {
    id: "immigration-status",
    en: "Current immigration status",
    es: "Estatus migratorio actual",
    labels: ["current immigration status", "immigration status", "immigration status (current)", "estatus migratorio", "estatus inmigratorio", "visa type", "tipo de visa", "visa classification", "status of entry", "immigrant status"],
    explain: "Tu situación legal actual en EE. UU.: turista, estudiante, residente, asilado, etc.",
    why: "Cada estatus tiene derechos, fechas y reglas distintas. Anotar el equivocado puede invalidar el trámite.",
    tip: "Revisa tu I-94 o tu permiso/documento más reciente para ver qué dice exactamente."
  },
  {
    id: "signature",
    en: "Signature",
    es: "Firma",
    labels: ["signature", "sign here", "firma", "firmado", "signed", "applicant signature", "firma del solicitante"],
    explain: "Tu firma, escrita a mano. Con ella declaras que todo lo que escribiste es verdad.",
    why: "Firmar es una promesa legal: si mentiste, la firma es la prueba. Firma solo cuando hayas revisado todo.",
    tip: "Nunca firmes un formulario en blanco. Lee, revisa, y después firma."
  },
  {
    id: "date-signed",
    en: "Date signed",
    es: "Fecha de la firma",
    labels: ["date signed", "signature date", "fecha de firma", "fecha de la firma", "date of signature"],
    explain: "El día en que firmaste el formulario.",
    why: "Muchas agencias cuentan los plazos desde la fecha de firma. Firmas con fecha vieja pueden rechazarse.",
    tip: "Firma y pon la fecha el mismo día, justo antes de enviarlo."
  },
  {
    id: "green-card",
    en: "Green card / Permanent resident card",
    es: "Tarjeta de residente (green card)",
    labels: ["green card", "permanent resident card", "resident alien card", "tarjeta verde", "residencia permanente", "lpr"],
    explain: "La tarjeta que demuestra que eres residente permanente legal de EE. UU.",
    why: "Es tu prueba de estatus para trabajar, viajar y hacer trámites. Traerla a la mano acelera todo.",
    tip: "Anota el número de la tarjeta y la fecha de expiración: los formularios lo piden seguido."
  },
  {
    id: "naturalization",
    en: "Naturalization / Certificate of citizenship",
    es: "Naturalización / Certificado de ciudadanía",
    labels: ["naturalization", "certificate of naturalization", "certificate of citizenship", "naturalizado", "naturalizada", "certificado de ciudadania", "certificado de ciudadanía"],
    explain: "El trámite o el documento con el que una persona se vuelve ciudadana de EE. UU.",
    why: "Un ciudadano tiene más derechos (votar, patrocinar familiares) y no necesita visa para entrar.",
    tip: "Guarda el certificado original en un lugar seguro; reemplazarlo cuesta tiempo y dinero."
  },
  {
    id: "form-i9",
    en: "Form I-9 (Employment eligibility)",
    es: "Formulario I-9 (derecho a trabajar)",
    labels: ["i-9", "i9", "employment eligibility", "form i-9", "i 9"],
    explain: "El formulario que tu empleador te pide para confirmar que puedes trabajar legalmente en EE. UU.",
    why: "Es obligatorio para cualquier trabajo en EE. UU. y debes llenarlo el primer día, con tus documentos (pasaporte, tarjeta, permiso).",
    tip: "Lleva contigo dos documentos de la lista del I-9: uno que pruebe identidad y otro que pruebe permiso de trabajo."
  },
  {
    id: "form-i485",
    en: "Form I-485 (Adjustment of status)",
    es: "Formulario I-485 (ajuste de estatus)",
    labels: ["i-485", "i485", "adjustment of status", "ajuste de estatus", "form i-485", "i 485"],
    explain: "El formulario para pedir la residencia permanente (green card) desde dentro de EE. UU.",
    why: "Es uno de los trámites más importantes: de él depende tu green card. Se llena con mucha documentación de apoyo.",
    tip: "Este formulario tiene muchos campos y requisitos: revisa cada casilla con calma o busca ayuda gratuita de un abogado de inmigración."
  },
  {
    id: "form-i130",
    en: "Form I-130 (Family petition)",
    es: "Formulario I-130 (petición familiar)",
    labels: ["i-130", "i130", "petition for alien relative", "peticion familiar", "petición familiar", "form i-130", "i 130"],
    explain: "El formulario con el que un ciudadano o residente pide que su familiar pueda obtener la green card.",
    why: "Es el primer paso para reunir a la familia: sin el I-130 aprobado, el familiar no puede seguir el trámite.",
    tip: "Necesitas pruebas del parentesco (actas de nacimiento, matrimonio). Consigue copias certificadas con tiempo."
  },
  {
    id: "form-i751",
    en: "Form I-751 (Remove conditions)",
    es: "Formulario I-751 (quitar condiciones)",
    labels: ["i-751", "i751", "petition to remove conditions", "quitar condiciones", "form i-751", "i 751"],
    explain: "El formulario que llenan los residentes condicionales por matrimonio para quitarle la condición a su green card.",
    why: "Si no lo envías a tiempo (90 días antes de que venzan los 2 años), pierdes la residencia.",
    tip: "Marca la fecha de expiración de tu green card en el calendario: el plazo de 90 días es obligatorio y estricto."
  },
  {
    id: "form-w4",
    en: "Form W-4 (Tax withholding)",
    es: "Formulario W-4 (retención de impuestos)",
    labels: ["w-4", "w4", "employee's withholding", "retencion", "retención", "form w-4", "w 4"],
    explain: "El formulario que llenas al empezar un trabajo para decir cuánto impuesto te descuenten de cada cheque.",
    why: "Si pones mal el número de dependientes, te descuentan de más (te lo devuelven al final del año) o de menos (terminas debiendo).",
    tip: "Si no estás segura, la opción más simple ('soltero, sin dependientes') suele retener lo correcto."
  },
  {
    id: "form-w2",
    en: "Form W-2 (Wage statement)",
    es: "Formulario W-2 (comprobante de sueldo)",
    labels: ["w-2", "w2", "wage and tax statement", "comprobante de sueldo", "form w-2", "w 2"],
    explain: "El documento que tu empleador te da cada enero con todo lo que ganaste y lo que te descontaron el año pasado.",
    why: "Lo necesitas para declarar impuestos cada año. Sin W-2 no puedes presentar tu declaración completa.",
    tip: "Guarda todos tus W-2 en un sobre: los necesitarás hasta 3 años después si te piden comprobantes."
  }
];

/* ---------- Utilidades de coincidencia ---------- */

function normalizeText(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes: fecha -> fecha
    .replace(/[^a-z0-9#\s]/g, " ")    // signos -> espacio (I-485 -> i 485)
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** ¿El texto normalizado contiene la etiqueta como palabra completa? */
function textHasLabel(textNorm, label) {
  const l = normalizeText(label);
  if (!l) return false;
  const re = new RegExp("(^|[^a-z0-9#])" + escapeRegExp(l) + "([^a-z0-9#]|$)", "i");
  return re.test(textNorm);
}

/** Devuelve los campos del glosario que aparecen en el texto OCR. */
function matchFields(text) {
  const textNorm = normalizeText(text);
  if (!textNorm) return [];
  return window.GLOSSARY.filter(function (f) {
    return f.labels.some(function (lbl) { return textHasLabel(textNorm, lbl); });
  });
}

/** La línea del texto OCR donde apareció el campo (para mostrar "lo vimos así"). */
function snippetForField(text, field) {
  const lines = String(text || "").split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
  for (let i = 0; i < lines.length; i++) {
    const norm = normalizeText(lines[i]);
    if (field.labels.some(function (lbl) { return textHasLabel(norm, lbl); })) {
      return lines[i].slice(0, 90);
    }
  }
  return null;
}

/** Líneas que no contienen ningún campo conocido (se muestran como "no reconocido"). */
function unmatchedLines(text, matchedFields) {
  const lines = String(text || "").split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
  return lines.filter(function (line) {
    const norm = normalizeText(line);
    return !matchedFields.some(function (f) { return f.labels.some(function (lbl) { return textHasLabel(norm, lbl); }); });
  });
}
