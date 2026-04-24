import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "fonts.json"), "utf8"));

function formatOf(file) {
  const ext = path.extname(file).slice(1).toLowerCase();
  if (ext === "woff2") return "woff2";
  if (ext === "woff") return "woff";
  if (ext === "ttf") return "truetype";
  return "opentype";
}

function dedupeVariants(variants) {
  const seen = Object.create(null);
  const out = [];
  for (const v of variants) {
    const key = `${v.weight}|${v.style || "normal"}`;
    if (seen[key]) continue;
    seen[key] = 1;
    out.push(v);
  }
  return out;
}

const faceCss = [];
for (const f of catalog.fonts) {
  const fam = JSON.stringify(f.family);
  for (const v of dedupeVariants(f.variants)) {
    const w = v.weight;
    const weight = typeof w === "number" ? String(w) : w;
    faceCss.push(
      `@font-face{font-family:${fam};src:url("${v.file}") format("${formatOf(v.file)}");font-weight:${weight};font-style:${v.style || "normal"};font-display:swap;}`,
    );
  }
}

const defaultSample =
  "The quick brown fox jumps over the lazy dog. 0123456789";

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const optionsHtml = catalog.fonts
  .map(
    (f, i) =>
      `        <option value="${i}"${i === 0 ? " selected" : ""}>${escapeHtml(f.family)}</option>`,
  )
  .join("\n");

const familyNamesJson = JSON.stringify(catalog.fonts.map((f) => f.family));

const n2Cols = (n) =>
  Array.from({ length: n }, () => "        <div class=\"n2-col\"></div>").join("\n");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>iudofia-fonts</title>
  <style>
${faceCss.join("\n")}
    :root {
      --n2-page: #0a0a0a;
      --n2-line: #161616;
      --n2-gap: 1.125rem;
      --n2-pad-x: 1.5rem;
      --ui-mono: ui-monospace, monospace;
      --sheet: rgba(20, 20, 22, 0.94);
      --field: rgba(42, 42, 46, 0.92);
      --text-dim: #9a9a9a;
      --text-preview: #b8b6b2;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      background: var(--n2-page);
      color: var(--text-dim);
      font-family: var(--ui-mono);
      font-size: 14px;
      line-height: 1.45;
      -webkit-font-smoothing: antialiased;
    }
    .n2-bg {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      min-height: 100%;
      column-gap: var(--n2-gap);
      padding-left: var(--n2-pad-x);
      padding-right: var(--n2-pad-x);
      display: grid;
    }
    .n2-bg--sm {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
    .n2-bg--md {
      display: none;
      grid-template-columns: repeat(10, minmax(0, 1fr));
    }
    @media (min-width: 768px) {
      .n2-bg--sm { display: none; }
      .n2-bg--md { display: grid; }
    }
    .n2-col {
      height: 100%;
      min-height: 100vh;
      border-left: 1.5px dashed var(--n2-line);
      border-right: 1.5px dashed var(--n2-line);
    }
    .shell {
      position: relative;
      z-index: 1;
      max-width: min(40rem, 100%);
      margin: 0 auto;
      padding: 2rem var(--n2-pad-x) 3rem;
      min-height: 100vh;
    }
    .sheet {
      background: var(--sheet);
      padding: 1rem 1rem 1.1rem;
      border: none;
    }
    select.font-switcher {
      display: block;
      width: 100%;
      margin: 0 0 0.85rem;
      padding: 0.35rem 1.35rem 0.35rem 0;
      font-size: 0.8125rem;
      font-weight: 400;
      letter-spacing: 0.06em;
      text-transform: none;
      font-family: var(--ui-mono);
      color: var(--text-dim);
      background: transparent;
      border: none;
      border-radius: 0;
      outline: none;
      cursor: pointer;
      -webkit-appearance: none;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%23525252' d='M0 1.2 5 5.2 10 1.2'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0 center;
    }
    select.font-switcher:focus { outline: none; }
    select.font-switcher option {
      background: #1a1a1c;
      color: #c8c8c8;
    }
    .preview {
      display: block;
      width: 100%;
      min-height: 14rem;
      padding: 0.75rem 0.65rem;
      margin: 0;
      font-size: clamp(1.2rem, 2.8vw, 1.75rem);
      line-height: 1.35;
      font-weight: 400;
      font-style: normal;
      font-synthesis: none;
      font-family: inherit;
      color: var(--text-preview);
      background: var(--field);
      border: none;
      border-radius: 0;
      outline: none;
      resize: vertical;
      box-shadow: none;
    }
    .preview:focus { outline: none; }
    .preview::placeholder { color: #6b6b6b; opacity: 1; }
  </style>
</head>
<body>
  <div class="n2-bg n2-bg--sm" aria-hidden>
${n2Cols(4)}
  </div>
  <div class="n2-bg n2-bg--md" aria-hidden>
${n2Cols(10)}
  </div>
  <div class="shell">
    <div class="sheet">
    <select id="fontSelect" class="font-switcher" aria-label="Font">
${optionsHtml}
    </select>
    <textarea
      id="preview"
      class="preview"
      rows="10"
      autocomplete="off"
      spellcheck="false"
    >${escapeHtml(defaultSample)}</textarea>
    </div>
  </div>
  <script>
    (function () {
      var names = ${familyNamesJson};
      var sel = document.getElementById("fontSelect");
      var preview = document.getElementById("preview");
      function applyFont() {
        var i = parseInt(sel.value, 10);
        if (isNaN(i) || !names[i]) return;
        preview.style.fontFamily = JSON.stringify(names[i]) + ", serif";
      }
      sel.addEventListener("change", applyFont);
      applyFont();
    })();
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(root, "index.html"), html);
console.log("Wrote index.html (" + catalog.fonts.length + " families, N2 shell + switcher)");
