"use client";

import { useEffect, useRef, useState, useCallback, type CSSProperties } from "react";
import { N2MobileBottomNavShell } from "@/components/portable/n2-mobile-bottom-nav-shell";

// ============================================================================
// N2Nav — Portable isiahudofia.com header component
//
// Desktop: position fixed, mix-blend-mode difference, 10-col grid
// Mobile: fixed top, flex-col, brand name + [Digital Archive] tagline
//
// Features:
// - Self-contained shuffle text hook (no external dependencies)
// - Fixed-width bracket positioning (never shifts during shuffle)
// - mix-blend-mode: difference for auto-inversion over any background
// - Fully typed with TypeScript
// ============================================================================

// -------------------------------------
// useShuffleText hook (embedded for portability)
// -------------------------------------

const SHUFFLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const SHUFFLE_INTERVAL_MS = 50;

export interface UseShuffleTextOptions {
  /** Resting text */
  text: string;
  /** Text to shuffle to on hover */
  hoverText?: string;
  intervalMs?: number;
}

export interface UseShuffleTextReturn {
  display: string;
  /** Attach to the text element — will receive a fixed measured width */
  textRef: React.RefObject<HTMLElement | null>;
  onEnter: () => void;
  onLeave: () => void;
  isHovered: boolean;
  shuffleOnce: () => void;
}

/**
 * useShuffleWords — Multi-word parallel shuffle matching isiahudofia.com buttonAnimations exactly.
 *
 * Algorithm (from bundle.js Q.shuffleWords):
 * - Text is split into words by whitespace
 * - Each word shuffles independently, all starting at the same time
 * - Each interval tick (50ms), one more character resolves per word
 * - "Work" (1 word, 4 chars) → 4 ticks × 50ms = 200ms
 * - "DIGITAL ARCHIVE" (2 words, 7+7 chars) → 7 ticks × 50ms = 350ms
 *
 * On mount: measures both default + hover text with a hidden probe span,
 * sets the wider value as a fixed px width on textRef so brackets never shift.
 *
 * mouseenter → shuffles current → hoverText
 * mouseleave → shuffles current → text
 */
function useShuffleWords({
  text,
  hoverText,
  intervalMs = SHUFFLE_INTERVAL_MS,
}: UseShuffleTextOptions): UseShuffleTextReturn {
  const target = hoverText ?? text;
  const [display, setDisplay] = useState(text);
  const [isHovered, setIsHovered] = useState(false);
  const textRef = useRef<HTMLElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pre-measure on mount → fix width so brackets never shift
  useEffect(() => {
    const el = textRef.current;
    if (!el || !hoverText) return;
    const probe = document.createElement("span");
    probe.style.cssText =
      "visibility:hidden;position:absolute;white-space:nowrap;top:-9999px;left:-9999px;";
    probe.style.font = window.getComputedStyle(el).font;
    document.body.appendChild(probe);
    probe.textContent = text;
    const w1 = probe.offsetWidth;
    probe.textContent = hoverText;
    const w2 = probe.offsetWidth;
    document.body.removeChild(probe);
    const maxW = Math.max(w1, w2);
    (el as HTMLElement).style.width = `${maxW + 4}px`;
    (el as HTMLElement).style.display = "inline-block";
    (el as HTMLElement).style.textAlign = "left";
  }, [text, hoverText]);

  const clearShuffle = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Split text into words, preserving whitespace.
   * Matches bundle.js: splitIntoWords uses /(\s+)/ pattern
   */
  const splitIntoWords = useCallback((str: string) => {
    return str.split(/(\s+)/).filter((s) => s.length > 0);
  }, []);

  /**
   * Check if string is whitespace
   */
  const isWhitespace = useCallback((str: string) => /^\s+$/.test(str), []);

  /**
   * Matches bundle.js Q.shuffleWords exactly:
   * - Split target into words (preserving whitespace)
   * - Each word has a resolved counter (chars locked in from left)
   * - Each tick: all words increment their resolved counter
   * - Whitespace segments pass through unchanged
   */
  const shuffleTo = useCallback(
    (to: string) => {
      clearShuffle();

      const words = splitIntoWords(to);
      const resolved = words.map((w) => (isWhitespace(w) ? w.length : 0));

      intervalRef.current = setInterval(() => {
        let allDone = true;

        const shuffled = words.map((word, i) => {
          if (isWhitespace(word)) return word;

          const maxResolved = word.length;
          if (resolved[i] < maxResolved) {
            allDone = false;
            resolved[i]++;
          }

          // Build word: resolved chars from target + random for rest
          let result = "";
          for (let j = 0; j < word.length; j++) {
            if (j < resolved[i]) {
              result += word[j];
            } else {
              result += SHUFFLE_CHARS[Math.floor(Math.random() * SHUFFLE_CHARS.length)];
            }
          }
          return result;
        });

        setDisplay(shuffled.join(""));

        if (allDone) {
          clearShuffle();
          setDisplay(to);
        }
      }, intervalMs);
    },
    [clearShuffle, intervalMs, splitIntoWords, isWhitespace]
  );

  const onEnter = useCallback(() => {
    setIsHovered(true);
    shuffleTo(target);
  }, [target, shuffleTo]);

  const onLeave = useCallback(() => {
    setIsHovered(false);
    shuffleTo(text);
  }, [text, shuffleTo]);

  // Shuffle without affecting hover state — for load animations
  const shuffleOnce = useCallback(() => {
    shuffleTo(target);
  }, [target, shuffleTo]);

  useEffect(() => () => clearShuffle(), [clearShuffle]);

  return { display, textRef, onEnter, onLeave, isHovered, shuffleOnce };
}

// -------------------------------------
// Default tokens (match isiahudofia.com)
// -------------------------------------

const DEFAULT_TEXT_STYLE: CSSProperties = {
  fontFamily: '"Fragment Mono", monospace',
  fontSize: "clamp(0.65rem, 0.9vw, 0.75rem)",
  lineHeight: "1.2em",
  letterSpacing: "0.02em",
  textTransform: "uppercase",
  fontWeight: 400,
  color: "inherit",
};

const MOBILE_TEXT_STYLE: CSSProperties = {
  fontFamily: '"Fragment Mono", monospace',
  fontSize: "12px", // ~20% larger than 10px
  lineHeight: "1.2em",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  fontWeight: 400,
  color: "inherit",
};

const DEFAULT_GRID_STYLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(10, minmax(0, 1fr))",
  columnGap: "1.125rem",
  width: "100%",
};

// -------------------------------------
// Types
// -------------------------------------

export interface N2NavLink {
  href: string;
  label: string;
  hoverLabel?: string;
}

export interface N2NavProps {
  /** Navigation links for desktop */
  links: N2NavLink[];
  /** Current pathname for active state (e.g., from usePathname()) */
  pathname?: string | null;
  /** Brand URL (defaults to isiahudofia.com) */
  brandHref?: string;
  /** Brand label (defaults to "DIGITAL ARCHIVE") */
  brandLabel?: string;
  /** Custom link component (e.g., Next.js Link). Accepts href, children, and standard anchor props. */
  linkComponent?: React.ComponentType<any>;
  /** Mobile brand name (defaults to "Isiah Udofia") */
  mobileBrandName?: string;
  /** Mobile tagline (defaults to "[Digital Archive]") */
  mobileTagline?: string;
  /** Text style override */
  textStyle?: CSSProperties;
  /** Grid style override */
  gridStyle?: CSSProperties;
  /** Header style override */
  headerStyle?: CSSProperties;
  /** Mobile header style override */
  mobileHeaderStyle?: CSSProperties;
  /** Custom className */
  className?: string;
  /** z-index value (default: 100) */
  zIndex?: number;
  /**
   * When true, only the desktop header is rendered (no mobile top bar or bottom nav).
   * Use on project pages that provide their own mobile chrome (e.g. N2ProjectNav).
   */
  desktopOnly?: boolean;
  /**
   * When true, nav links shuffle on load (homepage only).
   * Default: false (no shuffle on load for inner pages).
   */
  shuffleOnLoad?: boolean;
  /**
   * Starting column for nav links (1-indexed). Default: 7.
   * Use to adjust positioning for pages with fewer links.
   * For 2 links (Work, Lab), use 8 to position at cols 8-9.
   */
  linksStartColumn?: number;
  /**
   * Brand visual variant.
   * - "brackets" (default): `[LABEL]` with bracket fade — matches isiahudofia.com source.
   * - "arrow": label + NE arrow that translates on hover (text shuffle and arrow
   *   translate are independent hover regions). Used on designhub hub for external
   *   "Portfolio" link.
   */
  brandVariant?: "brackets" | "arrow";
}

// -------------------------------------
// Internal components
// -------------------------------------

interface NavLinkProps {
  href: string;
  label: string;
  hoverLabel?: string;
  isActive: boolean;
  textStyle: CSSProperties;
  linkComponent?: React.ComponentType<any>;
  shuffleOnLoad?: boolean;
}

function NavLink({ href, label, hoverLabel, isActive, textStyle, linkComponent, shuffleOnLoad = false }: NavLinkProps) {
  const { display, textRef, onEnter, onLeave, isHovered, shuffleOnce } = useShuffleWords({
    text: label,
    hoverText: hoverLabel ?? label,
  });

  useEffect(() => {
    if (shuffleOnLoad) {
      shuffleOnce();
    }
  }, [shuffleOnce, shuffleOnLoad]);

  const showBrackets = isActive || isHovered;
  const LinkComp = linkComponent ?? "a";

  const linkProps: Record<string, any> = {
    href,
    onMouseEnter: onEnter,
    onMouseLeave: onLeave,
    style: {
      display: "flex",
      alignItems: "center",
      position: "relative" as const,
      overflow: "hidden" as const,
      textDecoration: "none",
      color: "inherit",
      marginLeft: "-0.6rem",
      paddingTop: "0.2em",
      paddingBottom: "0.2em",
    },
    "aria-current": isActive ? "page" : undefined,
  };

  const finalProps = LinkComp === "a" ? { ...linkProps, target: "_self", rel: undefined } : linkProps;

  return (
    <LinkComp {...finalProps}>
      {/* Left bracket — always takes space, opacity fades */}
      <span
        aria-hidden
        style={{
          ...textStyle,
          marginRight: "0.2rem",
          opacity: showBrackets ? 1 : 0,
          color: isActive ? "#4B9CD3" : showBrackets ? "#969696" : "inherit",
          transition: "opacity 0.15s ease, color 0.15s ease",
          flexShrink: 0,
        }}
      >
        [
      </span>

      {/* Text — fixed px width, never shifts */}
      <span
        ref={textRef as React.RefObject<HTMLSpanElement>}
        style={{ ...textStyle, flexShrink: 0, whiteSpace: "nowrap" }}
      >
        {display}
      </span>

      {/* Right bracket — always takes space, opacity fades */}
      <span
        aria-hidden
        style={{
          ...textStyle,
          marginLeft: "0.2rem",
          opacity: showBrackets ? 1 : 0,
          color: isActive ? "#4B9CD3" : showBrackets ? "#969696" : "inherit",
          transition: "opacity 0.15s ease, color 0.15s ease",
          flexShrink: 0,
        }}
      >
        ]
      </span>
    </LinkComp>
  );
}

interface BrandLinkProps {
  href: string;
  label: string;
  textStyle: CSSProperties;
  shuffleOnLoad?: boolean;
  variant?: "brackets" | "arrow";
}

function BrandLink({ href, label, textStyle, shuffleOnLoad = false, variant = "brackets" }: BrandLinkProps) {
  const { display, textRef, onEnter, onLeave, shuffleOnce } = useShuffleWords({
    text: label,
    hoverText: label,
  });
  const [isArrowHovered, setIsArrowHovered] = useState(false);

  useEffect(() => {
    if (shuffleOnLoad) {
      shuffleOnce();
    }
  }, [shuffleOnLoad, shuffleOnce]);

  const isExternal = href.startsWith("http");

  if (variant === "arrow") {
    return (
      <a
        href={href}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        style={{
          display: "inline-flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
          textDecoration: "none",
          color: "inherit",
          marginLeft: 0,
          whiteSpace: "nowrap",
        }}
      >
        <span
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          style={{ display: "inline-flex" }}
        >
          <span
            ref={textRef as React.RefObject<HTMLSpanElement>}
            style={{
              ...textStyle,
              flexShrink: 0,
              whiteSpace: "nowrap",
              display: "inline-block",
              textAlign: "left",
            }}
          >
            {display}
          </span>
        </span>
        <span
          onMouseEnter={() => setIsArrowHovered(true)}
          onMouseLeave={() => setIsArrowHovered(false)}
          style={{
            marginLeft: "0.25rem",
            display: "inline-flex",
            color: isArrowHovered ? "#4b9cd3" : "inherit",
            transform: isArrowHovered ? "translate(0.15rem, -0.15rem)" : "translate(0, 0)",
            transition: "color 0.15s ease, transform 0.15s ease",
            marginRight: "0.3rem",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 10 10"
            fill="none"
            aria-hidden
            style={{ width: 9, height: 9, flexShrink: 0, display: "block" }}
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9.86001 0.0668945L9.76698 7.41621L8.76706 7.40356L8.83804 1.79597L0.707107 9.9269L0 9.21979L8.13093 1.08886L2.52334 1.15984L2.51069 0.159924L9.86001 0.0668945Z"
              fill="currentColor"
            />
          </svg>
        </span>
      </a>
    );
  }

  return (
    <a
      href={href}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        display: "inline-flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        marginLeft: "-0.6rem",
        whiteSpace: "nowrap",
      }}
    >
      <span aria-hidden style={{ ...textStyle, marginRight: "0.2rem", opacity: 1, flexShrink: 0 }}>
        [
      </span>
      <span
        ref={textRef as React.RefObject<HTMLSpanElement>}
        style={{
          ...textStyle,
          flexShrink: 0,
          whiteSpace: "nowrap",
          display: "inline-block",
          textAlign: "left",
        }}
      >
        {display}
      </span>
      <span aria-hidden style={{ ...textStyle, marginLeft: "0.2rem", opacity: 1, flexShrink: 0 }}>
        ]
      </span>
    </a>
  );
}

// -------------------------------------
// Mobile brand link — shuffle on hover
// -------------------------------------
interface MobileBrandLinkProps {
  href: string;
  label: string;
  textStyle: CSSProperties;
  shuffleOnLoad?: boolean;
}

function MobileBrandLink({ href, label, textStyle, shuffleOnLoad = false }: MobileBrandLinkProps) {
  const { display, onEnter, onLeave, shuffleOnce } = useShuffleWords({
    text: label,
    hoverText: label,
  });

  useEffect(() => {
    if (shuffleOnLoad) {
      shuffleOnce();
    }
  }, [shuffleOnLoad, shuffleOnce]);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        ...textStyle,
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <span style={{ flexShrink: 0, whiteSpace: "nowrap" }}>
        {display}
      </span>
    </a>
  );
}

// -------------------------------------
// Mobile nav link — for bottom tab bar
// -------------------------------------
interface MobileNavLinkProps {
  href: string;
  label: string;
  hoverLabel?: string;
  isActive: boolean;
  textStyle: CSSProperties;
  linkComponent?: React.ComponentType<any>;
  segmentBorder?: string;
}

function MobileNavLink({
  href,
  label,
  hoverLabel,
  isActive,
  textStyle,
  linkComponent,
  segmentBorder,
}: MobileNavLinkProps) {
  const { display, textRef, onEnter, onLeave, isHovered } = useShuffleWords({
    text: label,
    hoverText: hoverLabel ?? label,
  });

  const showBrackets = isActive || isHovered;
  const LinkComp = linkComponent ?? "a";

  const linkProps: Record<string, any> = {
    href,
    onMouseEnter: onEnter,
    onMouseLeave: onLeave,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative" as const,
      overflow: "hidden" as const,
      textDecoration: "none",
      color: "inherit",
      flex: 1,
      minHeight: "100%",
      // Silvery rail borders from mobile-chrome.css
      borderRight: segmentBorder ? `1px solid rgba(230, 238, 250, 0.55)` : undefined,
    },
    "aria-current": isActive ? "page" : undefined,
  };

  return (
    <LinkComp {...linkProps}>
      <span
        aria-hidden
        style={{
          ...textStyle,
          marginRight: "0.2rem",
          // On blue gradient: white text with slight opacity
          color: "rgba(255, 255, 255, 0.92)",
          opacity: showBrackets ? 1 : 0,
          transition: "opacity 0.15s ease",
          flexShrink: 0,
        }}
      >
        [
      </span>
      <span
        ref={textRef as React.RefObject<HTMLSpanElement>}
        style={{ ...textStyle, flexShrink: 0 }}
      >
        {display}
      </span>
      <span
        aria-hidden
        style={{
          ...textStyle,
          marginLeft: "0.2rem",
          color: "rgba(255, 255, 255, 0.92)",
          opacity: showBrackets ? 1 : 0,
          transition: "opacity 0.15s ease",
          flexShrink: 0,
        }}
      >
        ]
      </span>
    </LinkComp>
  );
}

// -------------------------------------
// N2Nav main component
// -------------------------------------

/**
 * N2Nav — isiahudofia.com style navigation header
 *
 * A portable navigation component with:
 * - Fixed positioning with mix-blend-mode: difference
 * - 10-column grid layout matching N2Background
 * - Shuffle text animation on hover (per-word, parallel)
 * - Fixed-width bracket positioning
 * - Responsive desktop/mobile layouts
 *
 * @example
 * ```tsx
 * // With Next.js
 * import Link from 'next/link'
 * import { usePathname } from 'next/navigation'
 *
 * <N2Nav
 *   links={[
 *     { href: "/work", label: "Work", hoverLabel: "WORK" },
 *     { href: "/about", label: "About", hoverLabel: "ABOUT" },
 *   ]}
 *   pathname={usePathname()}
 *   linkComponent={Link}
 * />
 * ```
 */
export function N2Nav({
  links,
  pathname = null,
  brandHref = "https://isiahudofia.com",
  brandLabel = "DIGITAL ARCHIVE",
  linkComponent,
  mobileBrandName = "Isiah Udofia",
  mobileTagline = "[Digital Archive]",
  textStyle = DEFAULT_TEXT_STYLE,
  gridStyle = DEFAULT_GRID_STYLE,
  headerStyle,
  mobileHeaderStyle,
  className,
  zIndex = 100,
  desktopOnly = false,
  shuffleOnLoad = false,
  linksStartColumn = 7,
  brandVariant = "brackets",
}: N2NavProps) {
  const combinedHeaderStyle: CSSProperties = {
    position: "fixed",
    inset: "0 0 auto 0",
    zIndex,
    mixBlendMode: "difference",
    color: "#f4f2ee",
    paddingTop: "1.25rem",
    paddingBottom: "1.25rem",
    paddingLeft: "1.5rem",
    paddingRight: "1.5rem",
    ...headerStyle,
  };

  const combinedMobileHeaderStyle: CSSProperties = {
    position: "fixed",
    inset: "0 0 auto 0",
    zIndex,
    mixBlendMode: "difference",
    color: "#f4f2ee",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: "0.5rem 1.5rem 0.625rem",
    paddingTop: "max(0.5rem, env(safe-area-inset-top))",
    ...mobileHeaderStyle,
  };

  const desktopHeader = (
    <header
      className={`hidden md:block ${className ?? ""}`}
      style={combinedHeaderStyle}
    >
      <div style={gridStyle}>
        {/* Brand — cols 1–2 */}
        <div style={{ gridColumn: "1 / span 2", display: "flex", alignItems: "center" }}>
          <BrandLink href={brandHref} label={brandLabel} textStyle={textStyle} shuffleOnLoad={shuffleOnLoad} variant={brandVariant} />
        </div>

        {/* Nav links — positioned from linksStartColumn */}
        {links.slice(0, 4).map((link, i) => {
          const isActive = Boolean(
            pathname === link.href ||
            (link.href !== "/portfolio" && pathname?.startsWith(link.href))
          );
          return (
            <div
              key={link.href}
              style={{
                gridColumn: `${linksStartColumn + i} / span 1`,
                display: "flex",
                alignItems: "center",
              }}
            >
              <NavLink
                href={link.href}
                label={link.label}
                hoverLabel={link.hoverLabel}
                isActive={isActive}
                textStyle={textStyle}
                linkComponent={linkComponent}
                shuffleOnLoad={shuffleOnLoad}
              />
            </div>
          );
        })}
      </div>
    </header>
  );

  if (desktopOnly) {
    return desktopHeader;
  }

  return (
    <>
      {desktopHeader}

      {/* ── Mobile top bar ──────────────────────────────────────────────────── */}
      <header
        className={`flex md:hidden ${className ?? ""}`}
        style={combinedMobileHeaderStyle}
      >
        <MobileBrandLink href={brandHref} label={mobileBrandName} textStyle={MOBILE_TEXT_STYLE} shuffleOnLoad={shuffleOnLoad} />
        <span style={{ ...MOBILE_TEXT_STYLE, opacity: 0.6, marginTop: "0.1rem" }}>
          {mobileTagline}
        </span>
      </header>

      {/* ── Mobile bottom nav (blur underlay + tint: compositing-safe on WebKit) ── */}
      <N2MobileBottomNavShell className={`md:hidden ${className ?? ""}`} zIndex={zIndex}>
        {links.slice(0, 4).map((link) => {
          const isActive = Boolean(
            pathname === link.href ||
            (link.href !== "/portfolio" && pathname?.startsWith(link.href))
          );
          return (
            <MobileNavLink
              key={link.href}
              href={link.href}
              label={link.label}
              hoverLabel={link.hoverLabel}
              isActive={isActive}
              textStyle={MOBILE_TEXT_STYLE}
              linkComponent={linkComponent}
              segmentBorder={undefined}  // No borders between segments
            />
          );
        })}
      </N2MobileBottomNavShell>
    </>
  );
}
