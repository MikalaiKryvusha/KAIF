#!/usr/bin/env node
// [NOT-TESTED] — md-to-pdf в этом дереве не разрешается (require.resolve → MODULE_NOT_FOUND), прогон НЕ наблюдался; ставить [TESTED] без наблюдения запрещено (TESTING_FRAMEWORK)
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
