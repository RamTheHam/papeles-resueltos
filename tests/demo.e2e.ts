import { test } from '@e2e-dev/web';
import { expect } from 'e2e';
import { mockOCR } from './helpers';

test('both home demo entries navigate, and back returns home', async ({ app, screen, browser }) => {
  await mockOCR(browser); await app.open();
  await expect(screen.getByRole('heading', /Nunca más/)).toBeVisible();
  await screen.getByRole('button', /Ver la demo/).tap();
  await expect(screen.getByRole('heading', 'Formulario de ejemplo')).toBeVisible();
  await expect(browser.locator('#demo-paper .cell')).toHaveCount(18);
  await screen.getByRole('button', 'Atrás').tap();
  await expect(screen.getByRole('heading', /Nunca más/)).toBeVisible();
  await screen.getByRole('button', 'Ver formulario de ejemplo →').tap();
  await expect(screen.getByRole('heading', 'Formulario de ejemplo')).toBeVisible();
  await screen.getByRole('button', 'Inicio').tap();
  await expect(screen.getByRole('heading', /Nunca más/)).toBeVisible();
  await expect(screen.getByText('MVP demo', { exact: false })).toBeVisible();
});

test('all 18 demo fields expose both languages and the complete curated explanation', { timeout: 90000 }, async ({ app, screen, browser }) => {
  await mockOCR(browser); await app.open();
  await screen.getByRole('button', /Ver la demo/).tap();
  const fields = await browser.evaluate(() => (window as any).__demoCellRefs.map((r: any) => ({ ...glossaryById(r.fid), value: r.data.value })));
  for (const field of fields) {
    const cell = screen.getByRole('button', field.es);
    await cell.tap();
    const dialog = screen.getByRole('dialog', field.en);
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(field.es)).toBeVisible();
    await expect(browser.locator('#sheet-explain')).toHaveText(field.explain);
    await expect(browser.locator('#sheet-why')).toHaveText(field.why);
    await expect(browser.locator('#sheet-tip')).toHaveText(field.tip);
    await expect(browser.locator('#sheet-note')).toContainText(field.value);
    await screen.getByRole('button', 'Cerrar').tap();
    await expect(dialog).toBeHidden();
  }
});

test('field list expands and collapses every bilingual entry', { timeout: 90000 }, async ({ app, screen, browser }) => {
  await mockOCR(browser); await app.open();
  await screen.getByRole('button', /Ver la demo/).tap();
  await screen.getByRole('button', 'Ver lista de campos').tap();
  await expect(screen.getByRole('button', 'Ocultar lista de campos')).toBeExpanded();
  await expect(browser.locator('#fieldlist details')).toHaveCount(18);
  const fields = await browser.evaluate(() => (window as any).__demoCellRefs.map((r: any) => glossaryById(r.fid)));
  for (let i = 0; i < fields.length; i++) {
    const item = browser.locator('#fieldlist details').nth(i);
    await item.getByText(fields[i].es).tap();
    await expect(item).toHaveAttribute('open', '');
    await expect(item).toContainText(fields[i].en);
    await expect(item.getByText(fields[i].tip)).toBeVisible();
    await item.getByText(fields[i].es).tap();
    await expect(item).not.toHaveAttribute('open', '');
  }
  await screen.getByRole('button', 'Ocultar lista de campos').tap();
  await expect(screen.getByRole('heading', 'Los 18 campos, explicados')).toBeHidden();
});

test('guided tour advances all 18 fields and finishes with usable controls', { timeout: 90000 }, async ({ app, screen, browser }) => {
  await mockOCR(browser); await app.open();
  await screen.getByRole('button', /Ver la demo/).tap();
  const names = await browser.evaluate(() => (window as any).__demoCellRefs.map((r: any) => glossaryById(r.fid).en));
  await screen.getByRole('button', /Explicar todo/).tap();
  for (const name of names) await expect(screen.getByRole('dialog', name)).toBeVisible({ timeout: 6000 });
  await expect(screen.getByRole('button', 'Cerrar')).toBeVisible();
  await expect(browser.locator('#sheet-tour-stop')).toBeHidden({ timeout: 6000 });
  await screen.getByRole('button', 'Cerrar').tap();
  await expect(screen.getByRole('button', /Explicar todo/)).toBeVisible();
});
