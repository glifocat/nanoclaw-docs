import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'node:fs';
import path from 'node:path';
const here = path.dirname(new URL(import.meta.url).pathname);
const xtermJs = fs.readFileSync(path.join(here, 'node_modules/@xterm/xterm/lib/xterm.js'), 'utf8');
const xtermCss = fs.readFileSync(path.join(here, 'node_modules/@xterm/xterm/css/xterm.css'), 'utf8');
const font = (w) => fs.readFileSync(path.join(here, `node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-${w}-normal.woff2`)).toString('base64');
const jobs = JSON.parse(process.argv[2]);
const browser = await chromium.launch();
for (const j of jobs) {
  const raw = fs.readFileSync(path.join(here, j.raw)).toString('base64');
  const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 1100, height: 800 } });
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:JBM;font-weight:400;src:url(data:font/woff2;base64,${font(400)})}
@font-face{font-family:JBM;font-weight:700;src:url(data:font/woff2;base64,${font(700)})}
${xtermCss}
body{margin:0;background:transparent}
#win{display:inline-block;background:#1e1e2e;border-radius:12px;overflow:hidden;border:1px solid #313244}
#bar{display:flex;align-items:center;gap:8px;padding:10px 14px;background:#181825;border-bottom:1px solid #313244;font:500 12.5px/1 -apple-system,"Inter","Segoe UI",sans-serif;color:#a6adc8}
#bar i{width:11px;height:11px;border-radius:50%;background:#45475a;display:inline-block}
#bar span{margin-left:8px;letter-spacing:.02em}
#term{padding:16px 20px 6px}
.xterm-viewport{overflow:hidden!important}
</style><div id="win"><div id="bar"><i></i><i></i><i></i><span>Terminal · illustration</span></div><div id="term"></div></div>
<script>${xtermJs}</script>`);
  await page.evaluate(async ({ raw, cols, rows }) => {
    await document.fonts.load('15px JBM'); await document.fonts.load('bold 15px JBM');
    const t = new Terminal({ cols, rows, fontFamily: 'JBM, "DejaVu Sans Mono", monospace', fontSize: 15, lineHeight: 1.25, cursorBlink: false, cursorInactiveStyle: 'none', allowTransparency: true,
      theme: { background: '#1e1e2e', foreground: '#cdd6f4', cursor: '#1e1e2e', black: '#45475a', red: '#f38ba8', green: '#a6e3a1', yellow: '#f9e2af', blue: '#89b4fa', magenta: '#f5c2e7', cyan: '#94e2d5', white: '#bac2de', brightBlack: '#6c7086', brightRed: '#f38ba8', brightGreen: '#a6e3a1', brightYellow: '#f9e2af', brightBlue: '#89b4fa', brightMagenta: '#f5c2e7', brightCyan: '#94e2d5', brightWhite: '#a6adc8' } });
    t.open(document.getElementById('term'));
    const bytes = Uint8Array.from(atob(raw), c => c.charCodeAt(0));
    await new Promise(r => t.write(bytes, r));
    let last = 0; const b = t.buffer.active;
    for (let i = 0; i < rows; i++) if (b.getLine(i)?.translateToString(true).trim()) last = i;
    t.resize(cols, Math.max(last + 1, b.cursorY + 1));
    await new Promise(r => setTimeout(r, 300));
  }, { raw, cols: j.cols, rows: j.rows });
  await page.locator('#win').screenshot({ path: path.join(here, j.out), omitBackground: true });
  await page.close();
}
await browser.close();
