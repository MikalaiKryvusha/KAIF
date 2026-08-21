#!/usr/bin/env node
// [TESTED: 2026-08-21 · живой прогон этой сессии: «✅ README.pdf generated», exit 0; md-to-pdf 5.2.5 резолвится из tools/node_modules]
// Прежний маркер [NOT-TESTED] называл причину, не воспроизводящуюся на HEAD (bugs/98 №3:
// «require.resolve → MODULE_NOT_FOUND» при живом модуле) — маркер с ложным обоснованием
// обесценивает разметку; переключён ПО НАБЛЮДЕНИЮ, как велит TESTING_FRAMEWORK (правило 2).
// tools/readme-pdf.mjs
// Render README.md → README.pdf using md-to-pdf (headless Chromium).
// First run downloads Chromium via puppeteer. Requires: cd tools && npm install
import { mdToPdf } from 'md-to-pdf';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const pdf = await mdToPdf(
  { path: join(ROOT, 'README.md') },
  {
    dest: join(ROOT, 'README.pdf'),
    launch_options: { args: ['--no-sandbox'] },
    pdf_options: { format: 'A4', margin: { top: '18mm', bottom: '18mm', left: '16mm', right: '16mm' } },
  },
);

if (pdf) console.log('✅ README.pdf generated');
