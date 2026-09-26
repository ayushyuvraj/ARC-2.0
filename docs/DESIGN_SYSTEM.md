# KEAOS Design System Guide
*Implementation reference for src/design.md across all KEAOS screens and components.*

---

## 1. Core Principles

The design posture of KEAOS is **authoritative, institutional, data-dense, and angular**.

### Non-Negotiable Rules
1. **Geometry**: ALL structural cards, layout containers, modal dialogs, form inputs, textareas, and primary buttons MUST have a border-radius of **`0px`** (`rounded-none`).
2. **Pills**: The **`9999px`** (`rounded-full`) radius is reserved exclusively for status indicators, taxonomy tags, and action chips.
3. **Contrast**: WCAG Level AA compliant contrast ratios across all states. High-contrast typography against clean white and subtle gray surfaces.
4. **Anonymity**: Never mention any proprietary consulting firm or corporate entity name. All branding must read strictly as *KEAOS | Enterprise Agent Studio*.

---

## 2. Color System & Design Tokens

Refer to `src/constants/designTokens.js` for programmatic tokens.

### Brand Palette
- **Deep Navy (`#001E50`)**: Main top navigation bar, high-contrast dark container surfaces.
- **Brand Blue (`#00338D`)**: Primary action buttons, active tab indicators, key headline highlights.
- **Medium Blue (`#005EB8`)**: Hover states on interactive elements and secondary buttons.
- **Pacific Blue (`#0091DA`)**: Progress indicators, focused border rings, secondary badges.
- **Subtle Surface (`#F5F6F8`)**: Application background, canvas grid background, zebra stripes.
- **Pure White (`#FFFFFF`)**: Primary information cards, modals, inspector background.
- **Subtle Border (`#E0E0E0`)**: Default card borders, dividers, table borders.

### Content & Taxonomy Accents
- **Amber (`#EAAA00`)**: Cost & Benefit, ROI, Ingress Gateway, Financial warnings.
- **Green (`#009A44`)**: Skills, Verification badges, Active status, Passed gates.
- **Teal (`#00A3A6`)**: Model Context Protocol (MCP), Infrastructure.
- **Magenta (`#6D2077`)**: Innovation, Policies & Guardrails, High-priority alerts.
- **Violet (`#483698`)**: Workforce, Episodic Memory, Cross-meeting sync.

---

## 3. Standard Screen Scaffolding Pattern

When building any new screen in KEAOS, wrap the screen in `ScreenScaffold` (`src/components/common/ScreenScaffold.jsx`):

```jsx
import React from 'react';
import ScreenScaffold from '../common/ScreenScaffold';
import { DESIGN_CLASSES } from '../../constants/designTokens';

export default function MyNewScreen() {
  return (
    <ScreenScaffold
      title="My Enterprise View Title"
      eyebrow="PILLAR OR SUBSYSTEM NAME"
      statusText="ACTIVE STATE"
      statusType="brand" // 'brand' | 'active' | 'pending' | 'alert'
      actions={
        <button className={DESIGN_CLASSES.buttonPrimary}>
          Primary Action
        </button>
      }
    >
      <div className="space-y-6">
        {/* Your angular 0px cards here */}
        <div className={DESIGN_CLASSES.card + ' p-5'}>
          <h3 className={DESIGN_CLASSES.sectionTitle}>Section Heading</h3>
          <p className="text-xs text-[#666666]">Body content...</p>
        </div>
      </div>
    </ScreenScaffold>
  );
}
```

---

## 4. Typography Hierarchy
- **Hero Title**: `text-base font-bold text-white tracking-wide font-['Univers',sans-serif]`
- **Section Heading**: `text-sm font-bold text-[#0B0F19] tracking-wide`
- **Subheading**: `text-xs font-bold uppercase tracking-wider text-[#0B0F19]`
- **Eyebrow Tag**: `text-[10px] font-bold uppercase tracking-wider text-[#00338D] font-mono`
- **Body Text**: `text-xs text-[#333333] leading-relaxed`
- **Metadata / Timestamps**: `text-[11px] text-[#666666] font-mono`
