# Svatopluk Font Licensing Report

**Date:** Sunday, May 25, 2026
**Font:** Svatopluk
**Foundry:** Indian Type Foundry (ITF)
**Source:** Fontshare
**Purpose:** License verification for absoluterest.com production use

---

## Executive Summary

**Svatopluk is 100% FREE for commercial use.**

| License Type | Status |
|--------------|--------|
| Personal Use | ✅ Free |
| Commercial Use | ✅ Free |
| Web / Digital | ✅ Free |
| Print | ✅ Free |
| Mobile Apps (iOS/Android) | ✅ Free |
| Broadcasting | ✅ Free |
| OEM / Embedded | ✅ Free |

**No licensing fees. No attribution required.**

---

## License Details

### ITF Free Font License (Fontshare)

Svatopluk is distributed under the **ITF Free Font License** via Fontshare — Indian Type Foundry's free font service.

**Key Terms:**
- Free for both personal AND commercial use
- No revenue limits or usage caps
- Any scale, any location worldwide
- Closed source (cannot modify/edit the font files)
- Can be used in: Print, Web, Mobile, Digital, Apps, ePub, Broadcasting, OEM

**Restrictions:**
- Cannot modify, edit, or create derivative versions of the font
- Cannot redistribute or resell the font files
- Cannot claim copyright over the font design

---

## Font Specifications

| Property | Value |
|----------|-------|
| Family | Svatopluk |
| Designer | Indian Type Foundry |
| Styles Available | Light, Regular, Medium, SemiBold, Bold, Black (+ italics) |
| File Format | OpenType (.otf) |
| Unicode Support | Full Latin character set |

---

## Usage Scope for absoluterest.com

### Confirmed Use Cases

| Use Case | Status | Notes |
|----------|--------|-------|
| Marketing website (absoluterest.com) | ✅ Approved | Web usage permitted |
| Onboarding flow | ✅ Approved | Web usage permitted |
| Mobile app (future iOS/Android) | ✅ Approved | Explicitly covered under license |
| Email templates | ✅ Approved | Digital/distribution permitted |
| PDF reports | ✅ Approved | Print/digital permitted |
| Internal tools | ✅ Approved | No restrictions |

### No Additional Licensing Required

Unlike Neue Haas Grotesk Display (which required separate web, desktop, and mobile licenses totaling $2,100+/year), **Svatopluk requires ZERO additional licenses**.

---

## Comparison: Neue Haas vs Svatopluk

| | Neue Haas Display | Svatopluk |
|---|---|---|
| **Web License** | ~$800/year | ✅ Free |
| **Desktop License** | ~$500/year | ✅ Free |
| **Mobile/App License** | ~$800/year | ✅ Free |
| **Annual Cost** | **$2,100+** | **$0** |
| **License Type** | Commercial (Monotype) | ITF Free (Fontshare) |
| **Font Source** | Monotype/Linotype | Indian Type Foundry |
| **Modification Rights** | No | No (both closed source) |

---

## Technical Implementation

### Font Files Deployed

```
public/fonts/svatopluk/
├── Svatopluk-Light-iF67d6f0d98142b.otf
├── Svatopluk-Regular-iF67d6f0d9954ce.otf
├── Svatopluk-Medium-iF67d6f0d9a273f.otf
├── Svatopluk-SemiBold-iF67d6f0d9afd52.otf
├── Svatopluk-Bold-iF67d6f0d9b5f70.otf
├── Svatopluk-Black-iF67d6f0d9c2423.otf
└── [Italic variants for each weight]
```

### CSS Configuration

```css
/* app/globals.css */
@font-face {
  font-family: 'Svatopluk';
  src: url('/fonts/svatopluk/Svatopluk-Regular-iF67d6f0d9954ce.otf') format('opentype');
  font-weight: 400;
  font-style: normal;
}
/* ... + 11 more @font-face declarations */
```

```typescript
/* tailwind.config.ts */
fontFamily: {
  'display': ['"Svatopluk"', 'sans-serif'],
  'signate': ['"Signate Grotesk"', 'sans-serif'],
}
```

### Migration Scope

- **102+ files updated** — Neue Haas Display → Svatopluk
- Directories: `app/`, `components/`
- Files: `.tsx`, `.ts` files

---

## Verification Sources

1. **Fontshare (Indian Type Foundry)**
   - https://fontshare.com/fonts/svatopluk
   - Explicitly lists: "Free for personal and commercial use"

2. **Tavily Research** (conducted May 25, 2026)
   - Confirmed ITF Free Font License terms
   - Verified commercial-use permissions across all media

3. **Cross-referenced against FONT-LICENSING-AUDIT.md**
   - Svatopluk listed alongside other confirmed free fonts (Switzer, Clash Display)

---

## Recommendation

**APPROVED for immediate production use.**

Svatopluk meets all licensing requirements for absoluterest.com with no ongoing costs. Migration is complete and ready for deployment.

---

**Prepared by:** Isiah Udofia
**Date:** May 25, 2026
**For:** Josh Ruben (Absolute Rest)
