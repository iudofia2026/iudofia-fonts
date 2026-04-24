"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { N2Background } from "@/components/portable/n2-background";
import { N2Nav, type N2NavLink } from "@/components/portable/n2-nav";

const N2_EASE = [0.22, 1, 0.36, 1] as const;

export type FontVariant = {
  file: string;
  weight: number | string;
  style?: string;
  variable?: boolean;
  variant?: string;
};

export type FontEntry = {
  family: string;
  id: string;
  variants: FontVariant[];
};

export type FontCatalogData = { fonts: FontEntry[] };

function formatOf(file: string) {
  const ext = file.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "woff2") return "woff2";
  if (ext === "woff") return "woff";
  if (ext === "ttf") return "truetype";
  return "opentype";
}

function dedupeVariants(variants: FontVariant[]) {
  const seen = new Set<string>();
  const out: FontVariant[] = [];
  for (const v of variants) {
    const key = `${v.weight}|${v.style ?? "normal"}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

function discreteWeightsForStyle(entry: FontEntry, style: string): number[] {
  const nums = new Set<number>();
  for (const v of dedupeVariants(entry.variants)) {
    if ((v.style ?? "normal") !== style) continue;
    if (typeof v.weight === "string" && /\d+\s+\d+/.test(v.weight)) continue;
    const w = v.weight;
    if (typeof w === "number") nums.add(w);
    else if (typeof w === "string" && /^\d+$/.test(w)) nums.add(Number(w));
  }
  return [...nums].sort((a, b) => a - b);
}

function variableRangeForStyle(
  entry: FontEntry,
  style: string,
): [number, number] | null {
  for (const v of dedupeVariants(entry.variants)) {
    if ((v.style ?? "normal") !== style) continue;
    if (typeof v.weight === "string" && /^\d+\s+\d+$/.test(v.weight.trim())) {
      const [a, b] = v.weight.trim().split(/\s+/).map(Number);
      if (!Number.isNaN(a) && !Number.isNaN(b)) return [a, b];
    }
  }
  return null;
}

function stylesForEntry(entry: FontEntry): string[] {
  return [
    ...new Set(
      dedupeVariants(entry.variants).map((v) => v.style ?? "normal"),
    ),
  ].sort();
}

function styleMenuLabel(s: string): string {
  if (s === "italic") return "Italic";
  if (s === "normal") return "Roman";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function weightMenuLabel(w: number): string {
  const names: Record<number, string> = {
    100: "Thin",
    200: "Extra light",
    300: "Light",
    400: "Regular",
    500: "Medium",
    600: "Semibold",
    700: "Bold",
    800: "Extra bold",
    900: "Black",
  };
  const name = names[w];
  return name ? `${w} — ${name}` : String(w);
}

function RangeField({
  label,
  min,
  max,
  step,
  value,
  onChange,
  suffix,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (n: number) => void;
  suffix?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#5a5a5a]">
          {label}
        </span>
        <span className="font-mono text-[10px] tabular-nums text-[#7a7a7a]">
          {value}
          {suffix ?? ""}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#2a2a2e] accent-[#4b9cd3] [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#c4c2be]"
      />
    </div>
  );
}

function AnimatedSelect<T extends string | number>({
  label,
  value,
  options,
  onChange,
  format,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (v: T) => void;
  format: (v: T) => string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#5a5a5a]">
        {label}
      </span>
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-1 flex w-full items-center justify-between gap-2 bg-[rgba(42,42,46,0.55)] px-3 py-2.5 text-left text-[13px] text-[#c4c2be] outline-none ring-1 ring-[#2a2a2e] transition-[box-shadow] hover:ring-[#3a3a40] focus-visible:ring-[#4b9cd3]"
        whileTap={{ scale: 0.995 }}
        transition={{ duration: 0.2, ease: N2_EASE }}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="min-w-0 truncate">{format(value)}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.28, ease: N2_EASE }}
          className="shrink-0 text-[#6b6b6b]"
          aria-hidden
        >
          ▾
        </motion.span>
      </motion.button>
      <AnimatePresence>
        {open ? (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: N2_EASE }}
            className="absolute left-0 right-0 top-full z-30 mt-1 max-h-52 overflow-y-auto bg-[rgba(18,18,20,0.96)] py-1 shadow-[0_12px_40px_rgba(0,0,0,0.45)] ring-1 ring-[#2a2a2e] backdrop-blur-md"
          >
            {options.map((opt) => (
              <li key={String(opt)} role="option" aria-selected={opt === value}>
                <button
                  type="button"
                  className={`w-full px-3 py-2 text-left text-[13px] transition-colors ${
                    opt === value
                      ? "bg-[rgba(75,156,211,0.12)] text-[#e0ded9]"
                      : "text-[#a8a8a8] hover:bg-[rgba(255,255,255,0.04)]"
                  }`}
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                >
                  {format(opt)}
                </button>
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

const SAMPLE = "The quick brown fox jumps over the lazy dog. 0123456789";
const PREVIEW_SNIP = "AaGg";

type TextAlign = "left" | "center" | "right" | "justify";

export function FontCatalog({ catalog }: { catalog: FontCatalogData }) {
  const hubBase =
    process.env.NEXT_PUBLIC_DESIGNHUB_ORIGIN ?? "http://localhost:8888";
  const hubLinks: N2NavLink[] = useMemo(
    () => [
      { href: `${hubBase}/`, label: "Work", hoverLabel: "WORK" },
      { href: `${hubBase}/lab`, label: "Lab", hoverLabel: "LAB" },
    ],
    [hubBase],
  );

  const [selected, setSelected] = useState(0);
  const [listOpen, setListOpen] = useState(true);
  const [typoOpen, setTypoOpen] = useState(true);
  const [text, setText] = useState(SAMPLE);
  const [selectedStyle, setSelectedStyle] = useState<string>("normal");
  const [weightNum, setWeightNum] = useState(400);
  const [fontSizePx, setFontSizePx] = useState(26);
  const [lineHeight, setLineHeight] = useState(1.35);
  const [letterSpacingEm, setLetterSpacingEm] = useState(0);
  const [textAlign, setTextAlign] = useState<TextAlign>("left");

  const faceCss = useMemo(() => {
    const parts: string[] = [];
    for (const f of catalog.fonts) {
      const fam = JSON.stringify(f.family);
      for (const v of dedupeVariants(f.variants)) {
        const w = v.weight;
        const weight = typeof w === "number" ? String(w) : w;
        const url = JSON.stringify("/" + v.file);
        parts.push(
          `@font-face{font-family:${fam};src:url(${url}) format("${formatOf(v.file)}");font-weight:${weight};font-style:${v.style ?? "normal"};font-display:swap;}`,
        );
      }
    }
    return parts.join("\n");
  }, [catalog.fonts]);

  useEffect(() => {
    const el = document.createElement("style");
    el.setAttribute("data-font-catalog", "1");
    el.textContent = faceCss;
    document.head.appendChild(el);
    return () => {
      el.remove();
    };
  }, [faceCss]);

  const current = catalog.fonts[selected] ?? catalog.fonts[0];

  useEffect(() => {
    const entry = catalog.fonts[selected];
    if (!entry) return;
    const stylesAvail = stylesForEntry(entry);
    let style = selectedStyle;
    if (!stylesAvail.includes(style)) {
      style = stylesAvail.includes("normal")
        ? "normal"
        : stylesAvail[0] ?? "normal";
      if (style !== selectedStyle) {
        setSelectedStyle(style);
        return;
      }
    }
    const discrete = discreteWeightsForStyle(entry, style);
    const vRange = variableRangeForStyle(entry, style);
    if (vRange) {
      setWeightNum((w) => Math.min(vRange[1], Math.max(vRange[0], w)));
    } else if (discrete.length) {
      setWeightNum((w) =>
        discrete.includes(w) ? w : discrete.includes(400) ? 400 : discrete[0],
      );
    } else {
      setWeightNum(400);
    }
  }, [selected, selectedStyle, catalog.fonts]);

  const styleOptions = useMemo(
    () => (current ? stylesForEntry(current) : []),
    [current],
  );

  const discreteWeights = useMemo(
    () => (current ? discreteWeightsForStyle(current, selectedStyle) : []),
    [current, selectedStyle],
  );

  const variableRange = useMemo(
    () => (current ? variableRangeForStyle(current, selectedStyle) : null),
    [current, selectedStyle],
  );

  const listShellClass =
    "scrollbar-thin space-y-0.5 overflow-x-hidden pr-1 md:max-h-[calc(100vh-11rem)] md:overflow-y-auto " +
    (listOpen
      ? "max-md:max-h-[42vh] max-md:overflow-y-auto max-md:opacity-100"
      : "max-md:max-h-0 max-md:overflow-hidden max-md:opacity-0 max-md:pointer-events-none");

  const typoShellClass =
    "scrollbar-thin space-y-5 overflow-x-hidden overflow-y-auto md:max-h-[calc(100vh-11rem)] " +
    (typoOpen
      ? "max-md:max-h-[min(68vh,520px)] max-md:opacity-100"
      : "max-md:max-h-0 max-md:overflow-hidden max-md:opacity-0 max-md:pointer-events-none");

  const alignments: { key: TextAlign; label: string }[] = [
    { key: "left", label: "Left" },
    { key: "center", label: "Center" },
    { key: "right", label: "Right" },
    { key: "justify", label: "Justify" },
  ];

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-[#9a9a9a]">
      <N2Background />
      <N2Nav
        links={hubLinks}
        linkComponent={Link}
        pathname={null}
        brandHref="https://www.isiahudofia.com/"
        brandLabel="Portfolio"
        brandVariant="arrow"
        mobileBrandName="Fonts"
        mobileTagline="[Type]"
        linksStartColumn={9}
      />

      <div className="hidden md:block" style={{ height: 80 }} />
      <div className="md:hidden" style={{ height: 56 }} />
      <div className="md:hidden" style={{ height: 48 }} />

      <div
        className="relative z-[1] mx-auto flex max-w-[100rem] flex-1 flex-col pb-20 md:flex-row md:pb-6"
        style={{
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
          minHeight: "calc(100vh - 80px)",
        }}
      >
        <motion.aside
          layout
          className="mb-2 flex w-full shrink-0 flex-col md:mb-0 md:w-[min(100%,300px)] md:border-r md:border-[#1f1f1f] md:pr-5"
          transition={{ duration: 0.35, ease: N2_EASE }}
        >
          <motion.button
            type="button"
            onClick={() => setListOpen((o) => !o)}
            className="flex w-full items-center justify-between py-2 text-left md:pointer-events-none md:py-3"
            aria-expanded={listOpen}
            whileTap={{ scale: 0.995 }}
            transition={{ duration: 0.2, ease: N2_EASE }}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6b6b6b]">
              Families
            </span>
            <motion.span
              animate={{ rotate: listOpen ? 180 : 0 }}
              transition={{ duration: 0.3, ease: N2_EASE }}
              className="text-[#6b6b6b] md:hidden"
              aria-hidden
            >
              ▾
            </motion.span>
          </motion.button>

          <ul
            className={listShellClass}
            style={{
              transitionProperty: "max-height, opacity",
              transitionDuration: "0.34s",
              transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {catalog.fonts.map((f, i) => (
              <li key={f.id}>
                <motion.button
                  type="button"
                  layout
                  onClick={() => setSelected(i)}
                  className={`relative w-full rounded-none px-2 py-2.5 text-left transition-colors duration-200 ${
                    i === selected
                      ? "bg-[rgba(42,42,46,0.55)] text-[#e0ded9]"
                      : "bg-transparent text-[#8a8a8a] hover:bg-[rgba(255,255,255,0.03)]"
                  }`}
                  transition={{ duration: 0.22, ease: N2_EASE }}
                >
                  {i === selected ? (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute bottom-2 left-0 top-2 w-0.5 bg-[#4b9cd3]"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 32,
                      }}
                    />
                  ) : null}
                  <span className="block truncate font-mono text-[9px] uppercase tracking-[0.14em] text-[#5a5a5a]">
                    {f.family}
                  </span>
                  <span
                    className="mt-1 block truncate text-[1.05rem] leading-none text-[#c4c2be]"
                    style={{
                      fontFamily: `${JSON.stringify(f.family)}, serif`,
                    }}
                  >
                    {PREVIEW_SNIP}
                  </span>
                </motion.button>
              </li>
            ))}
          </ul>
        </motion.aside>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 md:flex-row md:gap-0 md:pl-6">
          <motion.aside
            layout
            className="flex w-full shrink-0 flex-col md:mb-0 md:w-[min(100%,248px)] md:border-r md:border-[#1f1f1f] md:pr-5"
            transition={{ duration: 0.35, ease: N2_EASE }}
          >
            <motion.button
              type="button"
              onClick={() => setTypoOpen((o) => !o)}
              className="flex w-full items-center justify-between py-2 text-left md:pointer-events-none md:py-3"
              aria-expanded={typoOpen}
              whileTap={{ scale: 0.995 }}
              transition={{ duration: 0.2, ease: N2_EASE }}
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6b6b6b]">
                Type settings
              </span>
              <motion.span
                animate={{ rotate: typoOpen ? 180 : 0 }}
                transition={{ duration: 0.3, ease: N2_EASE }}
                className="text-[#6b6b6b] md:hidden"
                aria-hidden
              >
                ▾
              </motion.span>
            </motion.button>

            <div
              className={typoShellClass}
              style={{
                transitionProperty: "max-height, opacity",
                transitionDuration: "0.34s",
                transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              {styleOptions.length > 1 ? (
                <AnimatedSelect
                  label="Style"
                  value={selectedStyle}
                  options={styleOptions}
                  onChange={setSelectedStyle}
                  format={styleMenuLabel}
                />
              ) : null}

              {variableRange ? (
                <RangeField
                  label="Weight"
                  min={variableRange[0]}
                  max={variableRange[1]}
                  step={1}
                  value={weightNum}
                  onChange={setWeightNum}
                />
              ) : discreteWeights.length > 1 ? (
                <AnimatedSelect
                  label="Weight"
                  value={
                    discreteWeights.includes(weightNum)
                      ? weightNum
                      : discreteWeights[0]
                  }
                  options={discreteWeights}
                  onChange={setWeightNum}
                  format={weightMenuLabel}
                />
              ) : discreteWeights.length === 1 ? (
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#5a5a5a]">
                    Weight
                  </span>
                  <p className="mt-1 text-[13px] text-[#9a9a9a]">
                    {weightMenuLabel(discreteWeights[0])}
                  </p>
                </div>
              ) : null}

              <RangeField
                label="Size"
                min={10}
                max={96}
                step={1}
                value={fontSizePx}
                onChange={setFontSizePx}
                suffix="px"
              />

              <RangeField
                label="Line height"
                min={1}
                max={2.4}
                step={0.01}
                value={lineHeight}
                onChange={setLineHeight}
              />

              <RangeField
                label="Letter spacing"
                min={-0.08}
                max={0.35}
                step={0.005}
                value={letterSpacingEm}
                onChange={setLetterSpacingEm}
                suffix="em"
              />

              <div>
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#5a5a5a]">
                  Alignment
                </span>
                <div className="mt-2 grid grid-cols-4 gap-1">
                  {alignments.map(({ key, label }) => (
                    <motion.button
                      key={key}
                      type="button"
                      onClick={() => setTextAlign(key)}
                      className={`px-1 py-2 font-mono text-[9px] uppercase tracking-[0.1em] ring-1 transition-colors ${
                        textAlign === key
                          ? "bg-[rgba(75,156,211,0.14)] text-[#e0ded9] ring-[#4b9cd3]"
                          : "bg-[rgba(42,42,46,0.4)] text-[#8a8a8a] ring-[#2a2a2e] hover:ring-[#3a3a40]"
                      }`}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.18, ease: N2_EASE }}
                      title={label}
                    >
                      {label.slice(0, 1)}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>

          <motion.div
            key={current?.id ?? "x"}
            initial={{ opacity: 0.72, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.36, ease: N2_EASE }}
            className="flex min-h-0 min-w-0 flex-1 flex-col md:pl-6"
          >
            <textarea
              className="min-h-[14rem] w-full flex-1 resize-y border-0 bg-[rgba(42,42,46,0.92)] p-4 text-[#c4c2be] outline-none focus:outline-none focus-visible:ring-1 focus-visible:ring-[#4b9cd3]/40 md:min-h-[calc(100vh-11rem)]"
              style={{
                fontFamily: current
                  ? `${JSON.stringify(current.family)}, serif`
                  : "serif",
                fontWeight: weightNum,
                fontStyle: selectedStyle === "italic" ? "italic" : "normal",
                fontSize: `${fontSizePx}px`,
                lineHeight,
                letterSpacing: `${letterSpacingEm}em`,
                textAlign,
              }}
              spellCheck={false}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
