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

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>iudofia-fonts</title>
  <style>
${faceCss.join("\n")}
    :root {
      --bg: #faf9f7;
      --ink: #1a1a1a;
      --muted: #6b6b6b;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      background: var(--bg);
      color: var(--ink);
      font-family: system-ui, sans-serif;
      font-size: 15px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }
    .shell {
      max-width: 42rem;
      margin: 0 auto;
      padding: 3rem 1.5rem 5rem;
    }
    h1 {
      font-size: 0.7rem;
      font-weight: 500;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--muted);
      margin: 0 0 0.35rem;
    }
    .sub {
      font-size: 0.72rem;
      color: var(--muted);
      margin: 0 0 2rem;
      letter-spacing: 0.04em;
    }
    label.switcher-label {
      display: block;
      font-size: 0.65rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 0.45rem;
    }
    select.font-switcher {
      display: block;
      width: 100%;
      max-width: 100%;
      margin: 0 0 1.75rem;
      padding: 0;
      font-size: 0.9rem;
      font-weight: 400;
      letter-spacing: 0.02em;
      text-transform: none;
      color: var(--ink);
      background: transparent;
      border: none;
      border-radius: 0;
      outline: none;
      cursor: pointer;
      -webkit-appearance: none;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%236b6b6b' d='M1 1.5 6 6.5 11 1.5'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0 center;
      padding-right: 1.25rem;
    }
    select.font-switcher:focus {
      outline: none;
    }
    .preview {
      width: 100%;
      min-height: 12rem;
      padding: 0;
      margin: 0;
      font-size: clamp(1.35rem, 3.2vw, 2rem);
      line-height: 1.35;
      font-weight: 400;
      font-style: normal;
      font-synthesis: none;
      color: var(--ink);
      background: transparent;
      border: none;
      border-radius: 0;
      outline: none;
      resize: vertical;
    }
    .preview:focus { outline: none; }
    .preview::placeholder {
      color: var(--muted);
      opacity: 0.65;
    }
    footer {
      margin-top: 3rem;
      font-size: 0.65rem;
      letter-spacing: 0.06em;
      color: var(--muted);
    }
    footer code { font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="shell">
    <h1>iudofia-fonts</h1>
    <p class="sub">${catalog.fonts.length} families · every face is registered above; pick one to preview</p>

    <label class="switcher-label" for="fontSelect">Font</label>
    <select id="fontSelect" class="font-switcher" aria-label="Choose font family">
${optionsHtml}
    </select>

    <textarea
      id="preview"
      class="preview"
      rows="8"
      autocomplete="off"
      spellcheck="false"
      placeholder="Type here"
    >${escapeHtml(defaultSample)}</textarea>

    <footer><code>node scripts/sync-font-catalog.mjs</code> · <code>node scripts/build-index.mjs</code></footer>
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
console.log("Wrote index.html (" + catalog.fonts.length + " families, single preview + switcher)");
