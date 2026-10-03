import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { test } from '@e2e-dev/web';
import { expect } from 'e2e';
import { mockOCR } from './helpers';
const fixture: any = { window: {} };
runInNewContext(readFileSync('js/glossary.js', 'utf8'), fixture);
const fields: any[] = fixture.window.GLOSSARY;
const allLabels = fields.map(f => f.labels[0]).join('\n');

async function capture(app: any, screen: any, browser: any, input = 'Foto de la galería') {
  await app.open();
  await screen.getByRole('button', /Fotografiar mi formulario/).tap();
  await screen.getByLabel(input).setInputFiles('tests/fixtures/form.png');
  await expect(screen.getByRole('image', 'Vista previa de tu formulario')).toBeVisible();
  await expect(screen.getByRole('button', /Leer este formulario/)).toBeVisible();
}

test('all 27 OCR glossary matches have bilingual explanations, source and advice', { timeout: 90000 }, async ({ app, screen, browser }) => {
  await mockOCR(browser, { text: allLabels + '\nINSTRUCCIÓN SIN RECONOCER' });
  await capture(app, screen, browser);
  await screen.getByRole('button', /Leer este formulario/).tap();
  await expect(screen.getByRole('heading', 'Tu formulario, explicado')).toBeVisible();
  await expect(screen.getByRole('status').filter({ hasText: 'Listo' })).toContainText('27 de 27');
  await expect(browser.locator('#matched-list .match-item')).toHaveCount(27);
  for (const field of fields) {
    const button = screen.getByRole('button', 'Explicar ' + field.es);
    await button.tap();
    const dialog = screen.getByRole('dialog', field.en);
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(field.es)).toBeVisible();
    await expect(browser.locator('#sheet-explain')).toHaveText(field.explain);
    await expect(browser.locator('#sheet-why')).toHaveText(field.why);
    await expect(browser.locator('#sheet-tip')).toHaveText(field.tip);
    await expect(browser.locator('#sheet-note')).toContainText('Lo vimos así en tu foto');
    await screen.getByRole('button', 'Cerrar').tap();
    await expect(button).toBeFocused();
  }
  await expect(browser.locator('#unmatched-lines')).toHaveText('INSTRUCCIÓN SIN RECONOCER');
  expect(await browser.evaluate(() => (window as any).__ocr.terminated)).toBe(1);
  expect(await browser.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
  await screen.getByRole('button', 'Fotografiar otro').tap();
  await expect(screen.getByRole('heading', 'Fotografía tu formulario')).toBeVisible();
  await expect(screen.getByRole('button', /Leer este formulario/)).toBeHidden();
  expect(await browser.evaluate(() => document.querySelector('#capture-preview')!.getAttribute('src'))).toBeNull();
});

test('camera uploads work and bilingual accents/hyphens match without substring false positives', async ({ app, screen, browser }) => {
  await mockOCR(browser, { text: 'FECHA DE NACIMIENTO: 01/01/2000\nFormulario I–485\nSSN\nUnrecognized cityscape' });
  await capture(app, screen, browser, 'Foto de la cámara');
  await screen.getByRole('button', /Leer este formulario/).tap();
  await expect(browser.locator('#matched-list .match-item')).toHaveCount(3);
  await expect(screen.getByRole('button', 'Explicar Fecha de nacimiento')).toBeVisible();
  await expect(screen.getByRole('button', 'Explicar Formulario I-485 (ajuste de estatus)')).toBeVisible();
  await expect(screen.getByRole('button', 'Explicar Número de Seguro Social')).toBeVisible();
  await expect(browser.locator('#unmatched-lines')).toHaveText('Unrecognized cityscape');
  expect(await browser.evaluate(() => (window as any).GLOSSARY.every((f: any) => f.labels.every((l: string) => matchFields(l.toUpperCase()).some((m: any) => m.id === f.id))))).toBe(true);
  await screen.getByRole('button', 'Probar con la demo →').tap();
  await expect(screen.getByRole('heading', 'Formulario de ejemplo')).toBeVisible();
});

test('empty OCR text honestly explains no detected text and allows recovery', async ({ app, screen, browser }) => {
  await mockOCR(browser, { text: '' }); await capture(app, screen, browser);
  await screen.getByRole('button', /Leer este formulario/).tap();
  await expect(screen.getByText('No se detectó texto. Prueba con una foto más clara.')).toBeVisible();
  await expect(screen.getByText('No es tu culpa — es el MVP')).toBeVisible();
  await expect(screen.getByText('Lo que todavía no reconocemos')).toBeHidden();
  await screen.getByRole('button', 'Fotografiar otro').tap();
  await expect(screen.getByRole('heading', 'Fotografía tu formulario')).toBeVisible();
});

test('missing CDN engine gives an error and a demo escape route', async ({ app, screen, browser }) => {
  await mockOCR(browser, { missing: true }); await capture(app, screen, browser);
  await screen.getByRole('button', /Leer este formulario/).tap();
  await expect(screen.getByRole('heading', 'No pudimos leer tu formulario')).toBeVisible();
  await expect(screen.getByText(/no se pudo cargar desde la CDN/)).toBeVisible();
  await screen.getByRole('button', 'Probar con la demo →').tap();
  await expect(screen.getByRole('heading', 'Formulario de ejemplo')).toBeVisible();
});

for (const navigation of ['cancel', 'home', 'back']) {
  test(`pending OCR ${navigation} releases worker and ignores late results`, async ({ app, screen, browser }) => {
    await mockOCR(browser, { pending: true, text: 'SSN' }); await capture(app, screen, browser);
    await screen.getByRole('button', /Leer este formulario/).tap();
    await expect(screen.getByRole('heading', 'Leyendo tu formulario…')).toBeVisible();
    await expect.poll(() => browser.evaluate(() => Boolean((window as any).__resolveOCR))).toBe(true);
    if (navigation === 'cancel') await screen.getByRole('button', 'Cancelar lectura').tap();
    if (navigation === 'home') await screen.getByRole('button', 'Inicio').tap();
    if (navigation === 'back') await browser.back();
    await expect(screen.getByRole('heading', navigation === 'home' ? /Nunca más/ : 'Fotografía tu formulario')).toBeVisible();
    await expect.poll(() => browser.evaluate(() => (window as any).__ocr.terminated)).toBe(1);
    await browser.evaluate(() => (window as any).__resolveOCR());
    await expect(screen.getByRole('heading', 'Tu formulario, explicado')).toBeHidden();
    if (navigation !== 'home') {
      await screen.getByRole('button', /Leer este formulario/).tap();
      await expect.poll(() => browser.evaluate(() => (window as any).__ocr.recognized)).toBe(2);
      await browser.evaluate(() => (window as any).__resolveOCR());
      await expect(screen.getByRole('heading', 'Tu formulario, explicado')).toBeVisible();
    }
  });
}

test('invalid upload, corrupt image and picker cancellation recover safely', async ({ app, screen, browser }) => {
  await mockOCR(browser); await app.open();
  await screen.getByRole('button', /Fotografiar mi formulario/).tap();
  await screen.getByLabel('Foto de la galería').setInputFiles('tests/fixtures/not-an-image.txt');
  await expect(screen.getByRole('alert')).toHaveText('Elige una foto (JPG, PNG o similar).');
  await expect(screen.getByRole('button', /Leer este formulario/)).toBeHidden();
  await screen.getByLabel('Foto de la galería').setInputFiles('tests/fixtures/corrupt.png');
  await expect(screen.getByRole('alert')).toHaveText('No pudimos abrir esa foto. Elige otra imagen.');
  await expect(screen.getByRole('button', /Leer este formulario/)).toBeHidden();
  await screen.getByLabel('Foto de la galería').setInputFiles('tests/fixtures/form.png');
  await expect(screen.getByRole('button', /Leer este formulario/)).toBeVisible();
  await browser.evaluate(() => document.getElementById('file-gallery')!.dispatchEvent(new Event('change', { bubbles: true })));
  await expect(screen.getByRole('button', /Leer este formulario/)).toBeVisible();
  await screen.getByRole('button', 'Inicio').tap();
  await screen.getByRole('button', /Fotografiar mi formulario/).tap();
  await expect(screen.getByRole('button', /Leer este formulario/)).toBeHidden();
});

test('recognition failure releases its worker and supports retry', async ({ app, screen, browser }) => {
  await mockOCR(browser, { fail: true, text: 'SSN' }); await capture(app, screen, browser);
  await screen.getByRole('button', /Leer este formulario/).tap();
  await expect(screen.getByRole('heading', 'No pudimos leer tu formulario')).toBeVisible();
  await expect.poll(() => browser.evaluate(() => (window as any).__ocr.terminated)).toBe(1);
  await browser.evaluate(() => { (window as any).__ocr.fail = false; });
  await screen.getByRole('button', 'Fotografiar otro').tap();
  await screen.getByLabel('Foto de la galería').setInputFiles('tests/fixtures/form.png');
  await expect(screen.getByRole('button', /Leer este formulario/)).toBeVisible();
  await screen.getByRole('button', /Leer este formulario/).tap();
  await expect(screen.getByRole('heading', 'Tu formulario, explicado')).toBeVisible();
  await expect(screen.getByRole('button', 'Explicar Número de Seguro Social')).toBeVisible();
  await expect.poll(() => browser.evaluate(() => (window as any).__ocr.terminated)).toBe(2);
});

test('worker creation rejection gives a recoverable error', async ({ app, screen, browser }) => {
  await mockOCR(browser, { createFail: true }); await capture(app, screen, browser);
  await screen.getByRole('button', /Leer este formulario/).tap();
  await expect(screen.getByRole('heading', 'No pudimos leer tu formulario')).toBeVisible();
  await expect(screen.getByText(/No pudimos leer esa imagen/)).toBeVisible();
  expect(await browser.evaluate(() => (window as any).__ocr.terminated)).toBe(0);
  await screen.getByRole('button', 'Fotografiar otro').tap();
  await expect(screen.getByRole('heading', 'Fotografía tu formulario')).toBeVisible();
});

test('cancel during engine loading cleans up a worker created later', async ({ app, screen, browser }) => {
  await mockOCR(browser, { pendingWorker: true, text: 'SSN' }); await capture(app, screen, browser);
  await screen.getByRole('button', /Leer este formulario/).tap();
  await expect.poll(() => browser.evaluate(() => Boolean((window as any).__resolveWorker))).toBe(true);
  await screen.getByRole('button', 'Cancelar lectura').tap();
  await expect(screen.getByRole('heading', 'Fotografía tu formulario')).toBeVisible();
  await browser.evaluate(() => (window as any).__resolveWorker());
  await expect.poll(() => browser.evaluate(() => (window as any).__ocr.terminated)).toBe(1);
  expect(await browser.evaluate(() => (window as any).__ocr.recognized)).toBe(0);
  await expect(screen.getByRole('heading', 'Tu formulario, explicado')).toBeHidden();
});

test('camera and gallery buttons dispatch the correct system picker', async ({ app, screen, browser }) => {
  await mockOCR(browser); await app.open();
  await screen.getByRole('button', /Fotografiar mi formulario/).tap();
  await browser.evaluate(() => {
    (window as any).__pickers = [];
    for (const id of ['file-camera', 'file-gallery']) {
      (document.getElementById(id) as HTMLInputElement).click = () => { (window as any).__pickers.push(id); };
    }
  });
  await screen.getByRole('button', /Abrir cámara/).tap();
  expect(await browser.evaluate(() => (window as any).__pickers)).toEqual(['file-camera']);
  await screen.getByRole('button', /Elegir de la galería/).tap();
  expect(await browser.evaluate(() => (window as any).__pickers)).toEqual(['file-camera', 'file-gallery']);
  await expect(screen.getByLabel('Foto de la cámara')).toHaveAttribute('capture', 'environment');
  await expect(screen.getByLabel('Foto de la galería')).toHaveAttribute('accept', 'image/*');
});

test('leaving photo results clears image/text and history cannot resurrect them', async ({ app, screen, browser }) => {
  await mockOCR(browser, { text: 'SSN: 000-00-0000\nPrivate fixture note' }); await capture(app, screen, browser);
  await screen.getByRole('button', /Leer este formulario/).tap();
  await expect(screen.getByRole('heading', 'Tu formulario, explicado')).toBeVisible();
  await screen.getByRole('button', 'Explicar Número de Seguro Social').tap();
  await expect(browser.locator('#sheet-note')).toContainText('000-00-0000');
  await screen.getByRole('button', 'Cerrar').tap();
  await screen.getByRole('button', 'Inicio').tap();
  await expect(screen.getByRole('heading', /Nunca más/)).toBeVisible();
  expect(await browser.evaluate(() => document.querySelector('#sheet-note')!.textContent)).toBe('');
  expect(await browser.evaluate(() => ({ image: document.querySelector('#capture-preview')!.getAttribute('src'), matches: document.querySelector('#matched-list')!.textContent, unknown: document.querySelector('#unmatched-lines')!.textContent }))).toEqual({ image: null, matches: '', unknown: '' });
  await browser.back();
  await expect(screen.getByRole('heading', 'Fotografía tu formulario')).toBeVisible();
  await expect(screen.getByRole('button', /Leer este formulario/)).toBeHidden();
});
