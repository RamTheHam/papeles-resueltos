import { test } from '@e2e-dev/web';
import { expect } from 'e2e';
import { mockOCR } from './helpers';

test('capture hides the empty preview and read action', async ({ app, screen, browser }) => {
  await mockOCR(browser);
  await app.open();
  await screen.getByRole('button', /Fotografiar mi formulario/).tap();
  await expect(screen.getByRole('heading', 'Fotografía tu formulario')).toBeVisible();
  await expect(screen.getByRole('button', /Leer este formulario/)).toBeHidden();
});

test('dialog focuses close, traps keyboard and restores opener', async ({ app, screen, browser }) => {
  await mockOCR(browser);
  await app.open();
  await screen.getByRole('button', /Ver la demo/).tap();
  const first = screen.getByRole('button', 'Apellido(s)');
  await first.press('Enter');
  await expect(screen.getByRole('dialog', 'Last name / Surname')).toBeVisible();
  await expect(screen.getByRole('button', 'Cerrar')).toBeFocused();
  await browser.keyboard.press('Tab');
  expect(await browser.evaluate(() => document.getElementById('sheet')!.contains(document.activeElement))).toBe(true);
  await browser.keyboard.press('Escape');
  await expect(screen.getByRole('dialog')).toBeHidden();
  await expect(first).toBeFocused();
});

test('failed OCR sets a finished heading and releases its worker', async ({ app, screen, browser }) => {
  await mockOCR(browser, { fail: true });
  await app.open();
  await screen.getByRole('button', /Fotografiar mi formulario/).tap();
  await browser.locator('#file-gallery').setInputFiles('tests/fixtures/form.png');
  await expect(screen.getByRole('image', 'Vista previa de tu formulario')).toBeVisible();
  await screen.getByRole('button', /Leer este formulario/).tap();
  await expect(screen.getByText(/No pudimos leer esa imagen/)).toBeVisible();
  await expect(screen.getByRole('heading', 'No pudimos leer tu formulario')).toBeVisible();
  expect(await browser.evaluate(() => (window as any).__ocr.terminated)).toBe(1);
});

test('unknown OCR text preserves every line for review', async ({ app, screen, browser }) => {
  const lines = Array.from({ length: 20 }, (_, i) => `INSTRUCCIÓN DESCONOCIDA ${i + 1}`).join('\n');
  await mockOCR(browser, { text: lines });
  await app.open();
  await screen.getByRole('button', /Fotografiar mi formulario/).tap();
  await browser.locator('#file-gallery').setInputFiles('tests/fixtures/form.png');
  await screen.getByRole('button', /Leer este formulario/).tap();
  await expect(screen.getByText('No encontramos campos de nuestro glosario en el texto de la foto.')).toBeVisible();
  await expect(browser.locator('#unmatched-lines')).toContainText('INSTRUCCIÓN DESCONOCIDA 20');
  await screen.getByRole('region', 'Texto no reconocido').focus();
  await browser.keyboard.press('PageDown');
  await expect.poll(() => browser.evaluate(() => document.getElementById('unmatched-lines')!.scrollTop)).toBeGreaterThan(0);
});

test('closing the tour stops it instead of reopening the sheet', async ({ app, screen, browser }) => {
  await mockOCR(browser);
  await app.open();
  await screen.getByRole('button', /Ver la demo/).tap();
  await screen.getByRole('button', /Explicar todo/).tap();
  await expect(screen.getByRole('dialog')).toBeVisible();
  await screen.getByRole('button', 'Cerrar').tap();
  await expect(screen.getByRole('button', /Explicar todo/)).toBeVisible();
  await expect(screen.getByRole('dialog')).toBeHidden();
});
