import type { Browser } from '@e2e-dev/web';
export const ocrScript = '**/tesseract.min.js';
export async function mockOCR(browser: Browser, options: { text?: string; fail?: boolean; pending?: boolean; missing?: boolean; createFail?: boolean; pendingWorker?: boolean } = {}) {
  await browser.route('https://fonts.googleapis.com/**', route => route.abort());
  await browser.route('https://fonts.gstatic.com/**', route => route.abort());
  await browser.route(ocrScript, route => route.fulfill({ headers: { 'content-type': 'application/javascript' }, body: options.missing ? '' : `
    window.__ocr = { terminated: 0, recognized: 0, created: 0, fail: ${Boolean(options.fail)} };
    window.Tesseract = { createWorker: async (languages, mode, options) => {
      window.__ocr.created++;
      if (${Boolean(options.createFail)}) throw new Error('Fixture loading failure');
      if (${Boolean(options.pendingWorker)}) await new Promise(resolve => window.__resolveWorker = resolve);
      options.logger({ status: 'recognizing text', progress: 0.25 });
      return {
        recognize: async file => {
          window.__ocr.recognized++;
          if (window.__ocr.fail) throw new Error('Fixture recognition failure');
          if (${Boolean(options.pending)}) return new Promise(resolve => window.__resolveOCR = () => resolve({ data: { text: ${JSON.stringify(options.text || '')} } }));
          return { data: { text: ${JSON.stringify(options.text || '')} } };
        },
        terminate: async () => { window.__ocr.terminated++; }
      };
    } };
  ` }));
}
