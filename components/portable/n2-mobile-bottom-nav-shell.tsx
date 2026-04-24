"use client";

import type { CSSProperties, ReactNode } from "react";

/**
 * Near-max Gaussian radius for max spread (engines may clamp); lighter veils so glass stays airy.
 */
const BACKDROP_MUDDY = "blur(960px) saturate(85%) brightness(0.94)";

const NAV_BAR_BASE: CSSProperties = {
  position: "fixed",
  inset: "auto 0 0 0",
  color: "rgba(248, 252, 255, 0.95)",
  borderTop: "1px solid rgba(255, 255, 255, 0.22)",
  boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 -8px 28px rgba(0, 0, 0, 0.14)",
  minHeight: "40px",
  paddingBottom: "env(safe-area-inset-bottom, 0px)",
  isolation: "isolate",
  overflow: "hidden",
};

/** Light slate diffusion (blur carries most of the obscuring). */
const MUD_VEIL =
  "linear-gradient(180deg, rgba(18, 32, 48, 0.44) 0%, rgba(14, 28, 42, 0.38) 100%)";

/** Soft N2 tint. */
const BRAND_HAZE =
  "linear-gradient(180deg, rgba(75, 156, 211, 0.32) 0%, rgba(65, 138, 188, 0.24) 100%)";

const blurLayer: CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 0,
  WebkitBackdropFilter: BACKDROP_MUDDY,
  backdropFilter: BACKDROP_MUDDY,
  WebkitTransform: "translate3d(0,0,0)",
  transform: "translate3d(0,0,0)",
};

/**
 * Fixed mobile bottom chrome: extreme-spread blur + light veils + links.
 */
export function N2MobileBottomNavShell({
  children,
  className,
  zIndex = 100,
}: {
  children: ReactNode;
  className?: string;
  zIndex?: number;
}) {
  return (
    <nav className={className} style={{ ...NAV_BAR_BASE, zIndex }}>
      <div aria-hidden style={blurLayer} />

      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background: MUD_VEIL,
        }}
      />

      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
          background: BRAND_HAZE,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 3,
          display: "flex",
          width: "100%",
          minHeight: "40px",
          alignItems: "stretch",
        }}
      >
        {children}
      </div>
    </nav>
  );
}
