# Papeles Resueltos — MVP demo

> "Formularios, resueltos." Fotografías un formulario en papel y entiendes cada
> campo en español sencillo: qué significa, por qué importa y qué escribir.

Static, mobile-first web app (390px target), deployable to GitHub Pages.
No backend. No API keys. No servers.

## Qué hace (MVP)

1. **Demo instantánea** — un formulario de ejemplo (solicitud de beneficios,
   como las reales de inmigración) con los 18 campos más comunes. Toca
   cualquier campo o lanza el recorrido guiado: cada campo explicado en
   español, bilingüe (EN/ES), con "qué significa", "por qué importa" y un
   consejo. Es el "momento mágico" en menos de 15 segundos.
2. **Foto / subida real** — cámara o galería → OCR local con
   [Tesseract.js](https://tesseract.projectnaptha.com/) (vía CDN) → el texto
   se compara contra un **glosario curado bilingüe** (~27 campos: fecha de
   nacimiento, SSN, A-Number, estatus migratorio, formularios I-9/I-485/I-751,
   W-4, W-2…) y cada campo detectado se explica.
3. **Honestidad** — el texto que el glosario no reconoce se muestra tal cual,
   etiquetado "lo que todavía no reconocemos". Barra "MVP demo" fija en todas
   las pantallas. La foto nunca sale del dispositivo.

## Límites declarados (sin humo)

- La explicación de campos es un **glosario curado**, no IA generativa.
- El OCR solo reconoce los campos del glosario; formularios complejos quedan
  incompletos (y se dice en pantalla).
- La versión con IA (lectura de cualquier formulario + auto-llenado) requiere
  un backend y es la próxima iteración. Así lo dice la app.
- Los datos del formulario de ejemplo son ficticios.

## Estructura

```
papeles-resueltos/
├── index.html        # una sola página, 4 pantallas (home/demo/captura/resultados)
├── css/style.css     # mobile-first, tema "papel", 390px
├── js/glossary.js    # glosario bilingüe + matcher tolerante a tildes/guiones
├── js/demo.js        # formulario de ejemplo (18 celdas) + render
└── js/app.js         # navegación, hoja inferior, recorrido guiado, OCR local
```

## Probarlo

Abre `index.html` en cualquier navegador (o sírvelo estáticamente).
Primera vez con foto: requiere internet para cargar Tesseract.js y los
modelos de idioma (eng+spa) desde la CDN.

## Repo

Inicializado con `git init` + commit inicial. Listo para publicar en
GitHub Pages (rama `main` o `gh-pages`).
