import { readFileSync } from 'node:fs';
import { test } from '@e2e-dev/web';
import { expect } from 'e2e';
import { mockOCR } from './helpers';
const axe = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');

test('home, demo, capture, OCR results and modal have no serious accessibility violations', { timeout: 90000 }, async ({ app, screen, browser }) => {
  await mockOCR(browser, { text: 'SSN\nUnknown instructions' }); await app.open();
  await browser.evaluate(`() => { ${axe} }`);
  await browser.evaluate(() => {
    const style = document.createElement('style');
    style.textContent = '* { animation: none !important; transition: none !important; }';
    document.head.appendChild(style);
  });
  async function audit() {
    const violations = await browser.evaluate(async () => (await (window as any).axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map((v: any) => ({ id: v.id, impact: v.impact, targets: v.nodes.map((n: any) => n.target) })));
    expect(violations).toEqual([]);
  }
  await audit();
  await app.screenshot('home');
  await screen.getByRole('button', /Ver la demo/).tap(); await audit();
  await app.screenshot('demo');
  await screen.getByRole('button', 'Apellido(s)').tap(); await audit();
  await browser.keyboard.press('Escape');
  await screen.getByRole('button', 'Inicio').tap();
  await screen.getByRole('button', /Fotografiar mi formulario/).tap(); await audit();
  await screen.getByLabel('Foto de la galería').setInputFiles('tests/fixtures/form.png');
  await expect(screen.getByRole('button', /Leer este formulario/)).toBeVisible();
  await screen.getByRole('button', /Leer este formulario/).tap();
  await expect(screen.getByRole('heading', 'Tu formulario, explicado')).toBeVisible(); await audit();
  await app.screenshot('photo-results-fixture');
  await screen.getByRole('button', 'Explicar Número de Seguro Social').tap(); await audit();
});

test('screens fit 320px, 390px and tablet without horizontal overflow', async ({ app, screen, browser }) => {
  await mockOCR(browser); await app.open();
  for (const width of [320, 390, 768]) {
    await browser.setViewport({ width, height: 844 });
    await screen.getByRole('button', 'Inicio').tap();
    expect(await browser.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await screen.getByRole('button', /Ver la demo/).tap();
    await expect(screen.getByRole('heading', 'Formulario de ejemplo')).toBeVisible();
    expect(await browser.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await screen.getByRole('button', 'Correo electrónico').tap();
    await expect(screen.getByRole('dialog')).toBeVisible();
    expect(await browser.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await browser.keyboard.press('Escape');
  }
});

test('modal overlay and Escape dismiss it and tour controls stay keyboard usable', async ({ app, screen, browser }) => {
  await mockOCR(browser); await app.open();
  await screen.getByRole('button', /Ver la demo/).tap();
  await screen.getByRole('button', 'Apellido(s)').press('Space');
  await expect(screen.getByRole('dialog')).toBeVisible();
  await browser.locator('#sheet-overlay').tap({ position: { x: 5, y: 5 } });
  await expect(screen.getByRole('dialog')).toBeHidden();
  await screen.getByRole('button', /Explicar todo/).tap();
  await expect(screen.getByRole('dialog', 'Last name / Surname')).toBeVisible();
  await screen.getByRole('button', 'Siguiente campo').tap();
  await expect(screen.getByRole('dialog', 'First name / Given name')).toBeVisible();
  await screen.getByRole('button', 'Campo anterior').tap();
  await expect(screen.getByRole('dialog', 'Last name / Surname')).toBeVisible();
  await screen.getByRole('button', 'Cerrar').focus();
  await browser.keyboard.press('Shift+Tab');
  await expect(screen.getByRole('button', 'Detener recorrido')).toBeFocused();
  await browser.keyboard.press('Tab');
  await expect(screen.getByRole('button', 'Cerrar')).toBeFocused();
  await browser.keyboard.press('Escape');
  await expect(screen.getByRole('dialog')).toBeHidden();
  await expect(screen.getByRole('button', /Explicar todo/)).toBeFocused();
});
