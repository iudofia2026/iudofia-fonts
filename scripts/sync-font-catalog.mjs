import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const fontsDir = path.join(root, "fonts");
const jsonPath = path.join(root, "fonts.json");

const DISPLAY_NAMES = {
  "pp-neue-montreal": "PP Neue Montreal",
  "id-grotesk": "ID Grotesk",
  "fh-lecturis": "FH Lecturis",
  "iivorkurs": "II Vorkurs",
  "neogrotesk-sans": "Neogrotesk Sans",
  "aux-mono": "Aux Mono",
  "fragment-mono": "Fragment Mono",
  "protomono": "Proto Mono",
  "test-the-future-mono": "Test The Future Mono",
};

function titleCaseId(id) {
  if (DISPLAY_NAMES[id]) return DISPLAY_NAMES[id];
  return id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function guessWeight(filename) {
  const n = filename.toLowerCase();
  if (n.includes("xxthin") || n.includes("ultra")) return 100;
  if (n.includes("xthin") && !n.includes("xxthin")) return 200;
  if (n.includes("extralight") || n.includes("ultralight")) return 200;
  if (n.includes("thin") && !n.includes("xthin")) return 100;
  if (n.includes("light") && !n.includes("extralight")) return 300;
  if (n.includes("book") || n.includes("roman") || n.includes("regular")) return 400;
  if (n.includes("mediu") || n.includes("medium")) return 500;
  if (n.includes("semibold")) return 600;
  if (n.includes("extrabold")) return 800;
  if (n.includes("bold") && !n.includes("semibold")) return 700;
  if (n.includes("black") || n.includes("heavy")) return 900;
  return 400;
}

function guessStyle(filename) {
  const n = filename.toLowerCase();
  if (n.includes("italic") || n.includes("oblique") || /(^|[^a-z])it\.(otf|ttf)/.test(n)) return "italic";
  return "normal";
}

const exts = new Set([".woff2", ".woff", ".ttf", ".otf"]);

const raw = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const byId = new Map(raw.fonts.map((f) => [f.id, f]));

const diskDirs = fs
  .readdirSync(fontsDir)
  .filter((f) => fs.statSync(path.join(fontsDir, f)).isDirectory())
  .sort();

for (const id of diskDirs) {
  if (byId.has(id)) continue;
  const dirPath = path.join(fontsDir, id);
  const files = fs
    .readdirSync(dirPath)
    .filter((f) => exts.has(path.extname(f).toLowerCase()));
  if (files.length === 0) continue;

  const variants = files.sort().map((file) => ({
    file: `fonts/${id}/${file}`,
    weight: guessWeight(file),
    style: guessStyle(file),
  }));

  const entry = {
    family: titleCaseId(id),
    id,
    variants,
  };
  byId.set(id, entry);
}

const merged = [...byId.values()].sort((a, b) => a.family.localeCompare(b.family));
fs.writeFileSync(jsonPath, JSON.stringify({ fonts: merged }, null, 2) + "\n");
console.log("fonts.json:", merged.length, "families");
