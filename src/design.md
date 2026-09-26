# Design System Specification: KPMG in India
**Target URL:** https://kpmg.com/in/en.html  
**Document Version:** 1.0.0  
**Scope:** Brand Tokens, Layout Grids, Typography, Component Specs, and CSS Declarations.

---

## 1. Brand Architecture & Foundations

* **Brand Posture:** Authoritative, institutional, data-driven, editorial.
* **Geometry:** Angular, architectural layout. Predominantly `0px` border radius across core containers, cards, and modal components to convey institutional permanence.
* **Layout Principle:** Asymmetrical split grids, category-first metadata tagging, high typographic contrast, and generous negative space balanced by structured data density.
* **Accessibility Target:** WCAG 2.1 Level AA / AAA compliant contrast ratios (minimum 4.5:1 for body copy; 7:1 for headers against brand surfaces).

---

## 2. Color System

### 2.1 Core Brand Colors
| Token | Hex | RGB | Functional Role |
| :--- | :--- | :--- | :--- |
| `--color-kpmg-blue` | `#00338D` | `rgb(0, 51, 141)` | Primary brand color, primary CTAs, active states, key titles |
| `--color-medium-blue` | `#005EB8` | `rgb(0, 94, 184)` | Hover states, active text links, interactive elements |
| `--color-pacific-blue` | `#0091DA` | `rgb(0, 145, 218)` | Secondary accents, progress indicators, focused borders |
| `--color-navy-deep` | `#001E50` | `rgb(0, 30, 80)` | Deep hero section backgrounds, high-contrast dark surfaces |

### 2.2 Editorial & Industry Taxonomy Colors
KPMG maps color accents to specific industry verticals and content pillars:
| Token | Hex | Mapped Industry / Content Vertical |
| :--- | :--- | :--- |
| `--color-tax-amber` | `#EAAA00` | Tax, Regulatory, and Financial Services |
| `--color-tech-magenta`| `#6D2077` | Technology, Emerging Giants, Innovation |
| `--color-lead-purple` | `#470A68` | Board Leadership Center, Executive Perspectives |
| `--color-esg-green` | `#009A44` | Energy, Renewables, ESG, Sustainability |
| `--color-cyber-teal` | `#00A3A6` | Cybersecurity, Data Centres, DPDP, Infrastructure |
| `--color-work-violet` | `#483698` | Transformation, Workforce, Future of Work |

### 2.3 Neutrals & Surface Colors
| Token | Hex | Functional Role |
| :--- | :--- | :--- |
| `--color-surface-bg` | `#FFFFFF` | Primary surface background |
| `--color-surface-subtle`| `#F5F6F8` | Secondary section background, alternate zebra rows |
| `--color-surface-dark` | `#0B0F19` | Dark theme cards, footer backgrounds |
| `--color-text-primary` | `#0B0F19` | High-contrast headline and body copy |
| `--color-text-secondary`| `#333333` | Subtitles, article summaries, metadata copy |
| `--color-text-muted` | `#666666` | Form placeholders, timestamps, auxiliary labels |
| `--color-border-subtle` | `#E0E0E0` | Card borders, table borders, dividers |
| `--color-border-strong` | `#1E1E1E` | High-contrast focus borders and outline buttons |

---

## 3. Typography System

### 3.1 Font Stacks
* **Display / Headings:** `"KPMG Light"`, `"Univers"`, `"Helvetica Neue"`, `Arial`, sans-serif
* **Body / System Text:** `Arial`, `"Helvetica Neue"`, `Helvetica`, sans-serif
* **Data / Monospace:** `Consolas`, `Monaco`, `Courier New`, monospace (used in event timers, tickers)

### 3.2 Type Hierarchy
| Scale Name | Size (px / rem) | Weight | Line Height | Tracking | Transform |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Display** | `52px / 3.25rem` | 300 (Light) | `1.15` | `-0.02em` | None |
| **Section H1** | `40px / 2.5rem` | 300 (Light) | `1.2` | `-0.01em` | None |
| **Subheading H2** | `28px / 1.75rem` | 600 (SemiBold)| `1.25` | `0` | None |
| **Card Title H3** | `20px / 1.25rem` | 600 (SemiBold)| `1.35` | `0` | None |
| **Eyebrow / Tag** | `12px / 0.75rem` | 700 (Bold) | `1.4` | `+0.08em` | Uppercase |
| **Lead Paragraph** | `18px / 1.125rem`| 400 (Regular) | `1.5` | `0` | None |
| **Body Standard** | `15px / 0.9375rem`| 400 (Regular) | `1.55`| `0` | None |
| **Caption / Fine** | `12px / 0.75rem` | 400 (Regular) | `1.4` | `+0.01em` | None |
| **Interactive CTA** | `14px / 0.875rem`| 600 (SemiBold)| `1.2` | `+0.02em` | None |

---

## 4. Spacing, Grid & Layout

### 4.1 Spacing Scale
* **Base Metric:** `8px`
* **Scale Intervals:** `4px` (half), `8px` (base), `16px`, `24px`, `32px`, `48px`, `64px`, `96px`

### 4.2 Containers & Grid Rules
* **Max Width:** `1440px` (standard container: `1280px` max-width with `32px` gutter on desktop).
* **Column Setup:**
  * **Desktop (`≥ 1024px`):** 12 columns, `gap: 24px` or `gap: 32px`.
  * **Tablet (`768px – 1023px`):** 8 columns, `gap: 20px`.
  * **Mobile (`< 768px`):** 4 columns, `gap: 16px`, outer horizontal padding `16px`.

### 4.3 Breakpoints
* **Mobile (SM):** `< 768px`
* **Tablet (MD):** `768px – 1024px`
* **Desktop (LG):** `1025px – 1440px`
* **Wide (XL):** `> 1440px`

---

## 5. Shape, Elevation & Borders

* **Border Radius:**
  * Structural Cards, Modals, Inputs, Primary Buttons: `0px`
  * Action Chips / Wayfinding Pills: `9999px` (Full pill radius)
* **Borders:**
  * Default Container / Card Border: `1px solid var(--color-border-subtle)`
  * Accent Border: `2px solid var(--color-kpmg-blue)` (tab indicators, focus rings)
* **Shadows & Elevation:**
  * Flat default state (elevation `0`).
  * Subtle hover card elevation: `0 4px 16px rgba(0, 0, 0, 0.08)`.

---

## 6. Component Blueprint Specifications

### 6.1 Navigation Bar & Top Utility Bar
* **Top Utility Row:**
  * Background: `#FFFFFF`
  * Items: Country Selector (`India (EN)` with `expand_more` icon), `Submit RFP` button, Search trigger button, Hamburger menu toggle.
  * Border Bottom: `1px solid #E0E0E0`.
* **Primary Navigation Menu:**
  * Background: `#00338D` or `#FFFFFF` (context-dependent multi-tier header).
  * Links: `Insights`, `Industries`, `Services`, `How we work`, `Working with us`, `KPMG Global Services`.
  * Hover State: `2px solid #005EB8` bottom underline indicator.

### 6.2 Buttons
* **Primary CTA:**
  * Background: `var(--color-kpmg-blue)` (`#00338D`)
  * Text Color: `#FFFFFF`
  * Padding: `12px 24px`
  * Border Radius: `0px`
  * Hover: Background shifts to `var(--color-medium-blue)` (`#005EB8`)
* **Secondary / Outline CTA:**
  * Background: `transparent`
  * Border: `1px solid var(--color-kpmg-blue)`
  * Text Color: `var(--color-kpmg-blue)`
  * Padding: `11px 23px`
  * Border Radius: `0px`
  * Hover: Background `var(--color-kpmg-blue)`, Text `#FFFFFF`
* **Text / Inline Action Link:**
  * Format: `Read more ❯` or `Explore ❯`
  * Font Weight: `600`
  * Color: `var(--color-kpmg-blue)`
  * Text Decoration: None (underline on hover)

### 6.3 Content & Editorial Cards
* **Insight Standard Card:**
  * Background: `#FFFFFF`
  * Border: `1px solid #E0E0E0`
  * Border Radius: `0px`
  * Padding: `24px`
  * Vertical Hierarchy:
    1. Eyebrow: `12px Bold Uppercase` (Taxonomy-colored, e.g., `#00A3A6`)
    2. Headline: `20px SemiBold` (`#0B0F19`)
    3. Abstract: `14px Regular` (`#333333`, max-height 3-lines with ellipsis)
    4. Action Link: `Read more ❯` (`#00338D`)
* **Spotlight / Dark Event Banner Card:**
  * Background: `var(--color-navy-deep)` (`#001E50`)
  * Text Color: `#FFFFFF`
  * Padding: `32px`
  * Countdown Timer Element: Monospaced numerical values, highlighted with `--color-pacific-blue` (`#0091DA`).

### 6.4 Taxonomy / Wayfinding Pills
* Used for horizontal scrolling or filter blocks (`Artificial Intelligence ❯`, `Data Centres ❯`, `DPDP ❯`):
  * Padding: `6px 14px`
  * Border: `1px solid #CBD5E1`
  * Border Radius: `9999px`
  * Background: `#FFFFFF`
  * Typography: `13px Medium`, text color `#00338D`
  * Hover State: Background `#F0F4F8`, border-color `#005EB8`

### 6.5 Footer & Legal Architecture
* **Theme:** High-contrast neutral / dark layout (`#0B0F19` or split `#F5F6F8` / `#FFFFFF`).
* **Grid:** 4 primary columns (Contact, Media, Company, Apps & Social).
* **Legal Disclaimers:**
  * Font Size: `11px – 12px`, color: `#666666`.
  * Mandatory AI Disclosure Text: `*Some images have been enhanced using artificial intelligence (AI) technology.`
  * Standard copyright, LLP member firm governance statement, and OneTrust cookie preference triggers.

---

## 7. Interactive Behaviors & Motion

* **Transition Timing Function:** `cubic-bezier(0.4, 0, 0.2, 1)`
* **Standard Duration:**
  * Hover transitions (buttons, pills, links): `150ms`
  * Card lift / shadow elevation: `200ms`
  * Mega-menu dropdown panel expand: `250ms`
* **Focus State:** `2px solid #0091DA` with `2px` offset on all focusable inputs and links.

---

## 8. Ready-to-Use CSS Implementation Tokens

```css
:root {
  /* Brand Primary */
  --kpmg-blue: #00338D;
  --kpmg-blue-hover: #005EB8;
  --kpmg-blue-light: #0091DA;
  --kpmg-navy-dark: #001E50;

  /* Industry & Pillar Taxonomy */
  --kpmg-tax-amber: #EAAA00;
  --kpmg-tech-magenta: #6D2077;
  --kpmg-lead-purple: #470A68;
  --kpmg-esg-green: #009A44;
  --kpmg-cyber-teal: #00A3A6;
  --kpmg-work-violet: #483698;

  /* Neutrals */
  --kpmg-bg-white: #FFFFFF;
  --kpmg-bg-subtle: #F5F6F8;
  --kpmg-text-primary: #0B0F19;
  --kpmg-text-secondary: #333333;
  --kpmg-text-muted: #666666;
  --kpmg-border-subtle: #E0E0E0;

  /* Typography */
  --font-kpmg-display: "KPMG Light", "Univers", "Helvetica Neue", Arial, sans-serif;
  --font-kpmg-body: Arial, "Helvetica Neue", Helvetica, sans-serif;
  --font-kpmg-mono: "Consolas", "Monaco", monospace;

  /* Layout & Geometry */
  --radius-sharp: 0px;
  --radius-pill: 9999px;
  --max-content-width: 1440px;

  /* Shadows & Motion */
  --shadow-hover: 0 4px 16px rgba(0, 0, 0, 0.08);
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --duration-quick: 150ms;
}