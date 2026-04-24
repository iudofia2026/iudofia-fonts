"use client";

import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { N2Background } from "@/components/portable/n2-background";
import { N2Nav, type N2NavLink } from "@/components/portable/n2-nav";

const N2_EASE = [0.22, 1, 0.36, 1] as const;

/** Dropdown panel: quick fade + slight lift; rows stagger in (tighter than section stagger). */
const dropdownListVariants = {
  hidden: { opacity: 0, y: -5 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.22,
      ease: N2_EASE,
      staggerChildren: 0.026,
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: 0.15, ease: N2_EASE },
  },
} as const;

const dropdownRowVariants = {
  hidden: { opacity: 0, x: -6 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, ease: N2_EASE },
  },
} as const;

/** Shared chrome for catalog controls (N2 gallery–adjacent: quiet borders, accent focus) */
/** Gallery-1–style section titles (project / thesis blocks), scaled for the narrow column */
const settingsSectionTitle =
  "mb-4 font-sans text-[clamp(1.35rem,3.6vw,2.125rem)] font-semibold uppercase leading-[1.05] tracking-[0.02em] text-[#f4f2ee] antialiased";
const settingsFieldLabel =
  "font-mono text-[10px] uppercase tracking-[0.15em] text-[#6f6f6f]";
const settingsControlBase =
  "flex w-full items-center justify-between gap-2 border border-[#2a2a2e] bg-[rgba(18,18,20,0.72)] px-3 py-3 text-left transition-[border-color,background-color] duration-200 hover:border-[#3a3a3e] hover:bg-[rgba(22,22,26,0.82)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4b9cd3]/45";
const settingsList =
  "absolute left-0 right-0 top-full z-30 mt-px max-h-[min(18rem,52vh)] overflow-y-auto overscroll-contain border border-[#2a2a2e] bg-[rgba(14,14,16,0.97)] py-1 shadow-[0_16px_48px_rgba(0,0,0,0.5)] backdrop-blur-md";

function SettingsGroup({
  title,
  groupIndex,
  children,
}: {
  title: string;
  /** Stagger offset between Font (0) and Measure (1) blocks */
  groupIndex: number;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  const titleDelay = reduce ? 0 : 0.06 + groupIndex * 0.14;
  const bodyDelay = reduce ? 0 : titleDelay + 0.1;

  return (
    <div className="border-b border-[#1f1f1f] pb-6 last:border-b-0 last:pb-0">
      <motion.h2
        className={settingsSectionTitle}
        initial={reduce ? undefined : { opacity: 0, y: 12 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : 0.36, delay: titleDelay, ease: N2_EASE }}
      >
        {title}
      </motion.h2>
      <motion.div
        className="flex flex-col gap-5"
        initial={reduce ? undefined : { opacity: 0, y: 8 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : 0.34, delay: bodyDelay, ease: N2_EASE }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function useEscapeClose(open: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseRef.current();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
}

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
  formatDisplay,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (n: number) => void;
  suffix?: string;
  formatDisplay?: (v: number) => string;
}) {
  const reduce = useReducedMotion();
  const span = max - min;
  const pct = span <= 0 ? 0 : Math.min(100, Math.max(0, ((value - min) / span) * 100));
  const shown = formatDisplay ? formatDisplay(value) : String(value);
  const readout = `${shown}${suffix ?? ""}`;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className={settingsFieldLabel}>{label}</span>
        <motion.span
          key={readout}
          className="inline-block font-mono text-[10px] tabular-nums text-[#9a9a96]"
          initial={reduce ? undefined : { opacity: 0.45, y: 2 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.22, ease: N2_EASE }}
        >
          {readout}
        </motion.span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="font-catalog-range mt-3 w-full"
        style={{
          background: `linear-gradient(to right, rgba(255,255,255,0.6) ${pct}%, rgba(255,255,255,0.25) ${pct}%)`,
        }}
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
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);
  const selectId = `select-${label.replace(/\s+/g, "-").toLowerCase()}`;

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) close();
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEscapeClose(open, close);

  return (
    <div className="relative" ref={ref}>
      <span className={settingsFieldLabel}>{label}</span>
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`mt-2 ${settingsControlBase} text-[13px] text-[#e0ded9]`}
        whileTap={{ scale: 0.995 }}
        whileHover={reduce ? undefined : { scale: 1.004 }}
        transition={{ duration: 0.18, ease: N2_EASE }}
        aria-expanded={open}
        aria-haspopup="listbox"
        id={selectId}
      >
        <motion.span
          className="min-w-0 truncate"
          key={String(value)}
          initial={reduce ? undefined : { opacity: 0.65 }}
          animate={reduce ? undefined : { opacity: 1 }}
          transition={{ duration: 0.2, ease: N2_EASE }}
        >
          {format(value)}
        </motion.span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.26, ease: N2_EASE }}
          className="shrink-0 text-[#5c5c5c]"
          aria-hidden
        >
          ▾
        </motion.span>
      </motion.button>
      <AnimatePresence>
        {open ? (
          <motion.ul
            role="listbox"
            variants={!reduce ? dropdownListVariants : undefined}
            initial={reduce ? { opacity: 1, y: 0 } : "hidden"}
            animate={reduce ? { opacity: 1, y: 0 } : "show"}
            exit={reduce ? { opacity: 0, transition: { duration: 0.12 } } : "exit"}
            className={settingsList}
            aria-labelledby={selectId}
          >
            {options.map((opt) => (
              <motion.li
                key={String(opt)}
                role="option"
                aria-selected={opt === value}
                variants={!reduce ? dropdownRowVariants : undefined}
              >
                <button
                  type="button"
                  className={`w-full border-l-2 py-3 pl-3 pr-3 text-left text-[13px] transition-colors ${
                    opt === value
                      ? "border-[#4b9cd3] bg-[rgba(75,156,211,0.1)] text-[#f4f2ee]"
                      : "border-transparent text-[#a8a8a8] hover:bg-[rgba(255,255,255,0.04)]"
                  }`}
                  onClick={() => {
                    onChange(opt);
                    close();
                  }}
                >
                  {format(opt)}
                </button>
              </motion.li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

const SAMPLE = "The quick brown fox jumps over the lazy dog. 0123456789";
const PREVIEW_SNIP = "AaGg";

function FontFamilyDropdown({
  fonts,
  selectedIndex,
  onSelect,
}: {
  fonts: FontEntry[];
  selectedIndex: number;
  onSelect: (i: number) => void;
}) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = fonts[selectedIndex] ?? fonts[0];
  const close = () => setOpen(false);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) close();
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEscapeClose(open, close);

  return (
    <div className="relative" ref={ref}>
      <span className={settingsFieldLabel}>Family</span>
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`mt-2 ${settingsControlBase} items-start gap-3`}
        whileTap={{ scale: 0.995 }}
        whileHover={reduce ? undefined : { scale: 1.004 }}
        transition={{ duration: 0.18, ease: N2_EASE }}
        aria-expanded={open}
        aria-haspopup="listbox"
        id="font-family-select"
      >
        <span className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left">
          <motion.span
            key={current?.id ?? "x"}
            className="truncate font-mono text-[12px] uppercase tracking-[0.12em] text-[#8a8a8a]"
            initial={reduce ? undefined : { opacity: 0.5, y: 3 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: N2_EASE }}
          >
            {current?.family ?? "—"}
          </motion.span>
          <motion.span
            key={`${current?.id ?? "x"}-prev`}
            className="block w-full truncate pb-0.5 text-[1.08rem] leading-[1.22] text-[#e8e6e1]"
            style={{
              fontFamily: current
                ? `${JSON.stringify(current.family)}, serif`
                : "serif",
            }}
            initial={reduce ? undefined : { opacity: 0.55, y: 4 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: N2_EASE }}
          >
            {PREVIEW_SNIP}
          </motion.span>
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.26, ease: N2_EASE }}
          className="shrink-0 self-center text-[#5c5c5c]"
          aria-hidden
        >
          ▾
        </motion.span>
      </motion.button>
      <AnimatePresence>
        {open ? (
          <motion.ul
            role="listbox"
            aria-labelledby="font-family-select"
            variants={!reduce ? dropdownListVariants : undefined}
            initial={reduce ? { opacity: 1, y: 0 } : "hidden"}
            animate={reduce ? { opacity: 1, y: 0 } : "show"}
            exit={reduce ? { opacity: 0, transition: { duration: 0.12 } } : "exit"}
            className={settingsList}
          >
            {fonts.map((f, i) => (
              <motion.li
                key={f.id}
                role="option"
                aria-selected={i === selectedIndex}
                variants={!reduce ? dropdownRowVariants : undefined}
              >
                <button
                  type="button"
                  className={`w-full border-l-2 py-3 pl-3 pr-3 text-left transition-colors ${
                    i === selectedIndex
                      ? "border-[#4b9cd3] bg-[rgba(75,156,211,0.08)]"
                      : "border-transparent hover:bg-[rgba(255,255,255,0.04)]"
                  }`}
                  onClick={() => {
                    onSelect(i);
                    close();
                  }}
                >
                  <span className="block truncate font-mono text-[12px] uppercase tracking-[0.12em] text-[#8a8a8a]">
                    {f.family}
                  </span>
                  <span
                    className="mt-1 block truncate pb-0.5 text-[1.08rem] leading-[1.22] text-[#e8e6e1]"
                    style={{
                      fontFamily: `${JSON.stringify(f.family)}, serif`,
                    }}
                  >
                    {PREVIEW_SNIP}
                  </span>
                </button>
              </motion.li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

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
  const [text, setText] = useState(SAMPLE);
  const [selectedStyle, setSelectedStyle] = useState<string>("normal");
  const [weightNum, setWeightNum] = useState(400);
  const [fontSizePx, setFontSizePx] = useState(26);
  const [lineHeight, setLineHeight] = useState(1.35);
  const [letterSpacingEm, setLetterSpacingEm] = useState(0);

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

  const typoPanelClass =
    "scrollbar-thin flex max-h-[min(65vh,520px)] flex-col gap-8 overflow-x-hidden overflow-y-auto pr-0.5 md:max-h-[calc(100vh-11rem)]";

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
        className="relative z-[1] mx-auto flex max-w-[100rem] flex-1 flex-col pb-20 md:pb-6"
        style={{
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
          minHeight: "calc(100vh - 80px)",
        }}
      >
        <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 md:flex-row md:gap-0">
          <aside className="flex w-full shrink-0 flex-col md:mb-0 md:w-[min(100%,288px)] md:pr-6">
            <div className={typoPanelClass}>
              <SettingsGroup title="Font" groupIndex={0}>
                <FontFamilyDropdown
                  fonts={catalog.fonts}
                  selectedIndex={selected}
                  onSelect={setSelected}
                />

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
                    <span className={settingsFieldLabel}>Weight</span>
                    <div
                      className={`mt-2 ${settingsControlBase} cursor-default text-[13px] text-[#b8b8b4]`}
                    >
                      {weightMenuLabel(discreteWeights[0])}
                    </div>
                  </div>
                ) : null}
              </SettingsGroup>

              <SettingsGroup title="Measure" groupIndex={1}>
                <RangeField
                  label="Size"
                  min={10}
                  max={96}
                  step={1}
                  value={fontSizePx}
                  onChange={setFontSizePx}
                  suffix=" px"
                />

                <RangeField
                  label="Line height"
                  min={1}
                  max={2.4}
                  step={0.01}
                  value={lineHeight}
                  onChange={setLineHeight}
                  formatDisplay={(v) => String(Math.round(v * 100) / 100)}
                />

                <RangeField
                  label="Tracking"
                  min={-0.08}
                  max={0.35}
                  step={0.005}
                  value={letterSpacingEm}
                  onChange={setLetterSpacingEm}
                  suffix=" em"
                  formatDisplay={(v) => String(Math.round(v * 1000) / 1000)}
                />
              </SettingsGroup>
            </div>
          </aside>

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
