import { mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

// Serve authentic, pinned npm-distributed engine/WASM/language assets.
// No worker API, recognition response, glossary matcher or app code is mocked.
test('real Tesseract recognizes a synthetic bilingual uploaded form', { timeout: 120000, tags: ['real-ocr'] }, async ({ app, screen, browser }) => {
  const assets: string[] = [];
  await browser.route('https://fonts.googleapis.com/**', route => route.abort());
  await browser.route('https://fonts.gstatic.com/**', route => route.abort());
  await browser.route('https://cdn.jsdelivr.net/npm/**', async route => {
    const path = new URL(route.request.url).pathname.slice('/npm/'.length);
    const local = path
      .replace(/^tesseract\.js@[^/]+\//, 'tesseract.js/')
      .replace(/^tesseract\.js-core@[^/]+\//, 'tesseract.js-core/');
    const allowed = /^(tesseract\.js\/dist\/(tesseract|worker)\.min\.js|tesseract\.js-core\/tesseract-core[^/]*\.(wasm|wasm\.js)|@tesseract\.js-data\/(eng|spa)\/4\.0\.0_best_int\/(eng|spa)\.traineddata\.gz)$/.test(local);
    if (!allowed) throw new Error(`Unexpected OCR asset: ${path}`);
    assets.push(local);
    await route.fulfill({ status: 302, headers: { location: new URL('/node_modules/' + local, app.baseUrl).href, 'access-control-allow-origin': '*' }, body: '' });
  });
  await app.open();
  const png = await browser.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1600; canvas.height = 1000;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#000'; context.font = '48px sans-serif';
    const lines = [
      'FORMULARIO DE EJEMPLO',
      'Last name: RAMOS',
      'First name: ANA',
      'Fecha de nacimiento: 04/12/1989',
      'SSN: 000-00-0000',
      'Firma: Ana Ramos',
      'City: CHICAGO'
    ];
    lines.forEach((line, i) => context.fillText(line, 80, 100 + i * 115));
    return canvas.toDataURL('image/png').split(',')[1];
  });
  await mkdir('.e2e/fixtures', { recursive: true });
  const image = `.e2e/fixtures/bilingual-form-${randomUUID()}.png`;
  await writeFile(image, Buffer.from(png, 'base64'));
  await screen.getByRole('button', /Fotografiar mi formulario/).tap();
  await screen.getByLabel('Foto de la galería').setInputFiles(image);
  await expect(screen.getByRole('image', 'Vista previa de tu formulario')).toBeVisible();
  await app.screenshot('real-ocr-synthetic-upload');
  await screen.getByRole('button', /Leer este formulario/).tap();
  await expect(screen.getByRole('heading', 'Tu formulario, explicado')).toBeVisible({ timeout: 90000 });
  for (const name of ['Apellido(s)', 'Primer nombre', 'Fecha de nacimiento', 'Número de Seguro Social', 'Firma', 'Ciudad']) {
    await expect(screen.getByRole('button', 'Explicar ' + name)).toBeVisible();
  }
  await expect(browser.locator('#matched-list .match-item')).toHaveCount(6);
  await expect(browser.locator('#matched-list')).toContainText('RAMOS');
  expect(assets).toContain('tesseract.js/dist/tesseract.min.js');
  expect(assets).toContain('tesseract.js/dist/worker.min.js');
  expect(assets.some(path => /^tesseract\.js-core\/.*\.wasm\.js$/.test(path))).toBe(true);
  expect(assets).toContain('@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz');
  expect(assets).toContain('@tesseract.js-data/spa/4.0.0_best_int/spa.traineddata.gz');
  await app.screenshot('real-ocr-synthetic-results');
  await screen.getByRole('button', 'Explicar Fecha de nacimiento').tap();
  await expect(screen.getByRole('dialog', 'Date of birth')).toBeVisible();
  await expect(browser.locator('#sheet-note')).toContainText('04/12/1989');
  await screen.getByRole('button', 'Cerrar').tap();
  await screen.getByRole('button', 'Fotografiar otro').tap();
  await expect(screen.getByRole('button', /Leer este formulario/)).toBeHidden();
});
