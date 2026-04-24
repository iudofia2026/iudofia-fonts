"use client";

/**
 * N2Background — Dashed vertical column grid background for isiahudofia.com portfolio pages.
 *
 * Matches isiahudofia.com exactly:
 * - 10-column fluid grid: repeat(10, 1fr) with 1.5rem side padding and 1.125rem gap
 * - Both bg grid and nav share the same grid token so columns align perfectly
 *
 * Parent must be `position: relative` with `min-height: 100vh`.
 * Grid sits at z-index 0; wrap content at z-index 1.
 *
 * @example
 * ```tsx
 * // Standard portfolio pages — 10 fluid cols with 1.5rem padding
 * <N2Background />
 *
 * // Custom tokens
 * <N2Background cols={8} lineColor="#1a1a1a" gap="1rem" />
 * ```
 */

export interface N2BackgroundProps {
  /** Number of columns. Default: 10 */
  cols?: number;
  /** Column line color. Default: #161616 */
  lineColor?: string;
  /** Gap between columns. Default: 1.125rem (18px) */
  gap?: string;
  /** Side padding — must match nav paddingX. Default: 1.5rem (24px) */
  paddingX?: string;
  /** Border style. Default: dashed */
  borderStyle?: "dashed" | "solid" | "dotted";
  /** Border width. Default: 1.5px */
  borderWidth?: string;
  /** Number of mobile columns. Default: 4 */
  mobileCols?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function N2Background({
  cols = 10,
  lineColor = "#161616",
  gap = "1.125rem",
  paddingX = "1.5rem",
  borderStyle = "dashed",
  borderWidth = "1.5px",
  mobileCols = 4,
  className,
  style,
}: N2BackgroundProps) {
  const border = `${borderWidth} ${borderStyle} ${lineColor}`;

  return (
    <>
      {/* Desktop: fluid 10-col grid with side padding — matches nav grid exactly */}
      <div
        aria-hidden
        className={`hidden md:grid ${className ?? ""}`}
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          columnGap: gap,
          paddingLeft: paddingX,
          paddingRight: paddingX,
          zIndex: 0,
          minHeight: "100%",
          ...style,
        }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            style={{ height: "100%", minHeight: "100vh", borderLeft: border, borderRight: border }}
          />
        ))}
      </div>

      {/* Mobile: fluid grid with same padding */}
      <div
        aria-hidden
        className={`grid md:hidden ${className ?? ""}`}
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          gridTemplateColumns: `repeat(${mobileCols}, minmax(0, 1fr))`,
          columnGap: gap,
          paddingLeft: paddingX,
          paddingRight: paddingX,
          zIndex: 0,
          minHeight: "100%",
          ...style,
        }}
      >
        {Array.from({ length: mobileCols }).map((_, i) => (
          <div
            key={i}
            style={{ height: "100%", minHeight: "100vh", borderLeft: border, borderRight: border }}
          />
        ))}
      </div>
    </>
  );
}
