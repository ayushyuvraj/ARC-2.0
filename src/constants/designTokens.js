/**
 * KEAOS DESIGN TOKENS
 * Direct JavaScript implementation of the design specification in src/design.md
 * 
 * Rules for all screens and components:
 * 1. Geometry: Angular 0px border-radius for all containers, cards, inputs, and primary buttons.
 * 2. Pills: 9999px border-radius strictly for taxonomy badges, status indicators, and action chips.
 * 3. Color Hierarchy:
 *    - Deep Navy (#001E50): Primary navigation bar and high-contrast dark surfaces.
 *    - Brand Blue (#00338D): Primary CTAs, active states, active tab borders.
 *    - Medium Blue (#005EB8): Hover states on interactive elements.
 *    - Subtle Surface (#F5F6F8): App workspace background, zebra stripes.
 *    - Pure White (#FFFFFF): Primary card surfaces.
 * 4. Strict Anonymity: No proprietary corporate or consulting firm names allowed anywhere.
 */

export const DESIGN_TOKENS = {
  // Brand Color Palette (Section 2.1 of design.md)
  colors: {
    brandBlue: '#00338D',     // Primary brand color, primary CTAs, active states
    mediumBlue: '#005EB8',    // Hover states, active text links
    pacificBlue: '#0091DA',   // Secondary accents, progress indicators, focused borders
    navyDeep: '#001E50',      // Deep header background, high-contrast dark surfaces

    // Editorial & Industry Taxonomy Colors (Section 2.2 of design.md)
    taxonomy: {
      amber: '#EAAA00',       // Cost & Benefit, ROI, Financial Services
      magenta: '#6D2077',     // Technology, Emerging Giants, Innovation
      purple: '#470A68',      // Executive Governance, Leadership
      green: '#009A44',       // Skills, Sustainability, Active Status, Success
      teal: '#00A3A6',        // MCP, Infrastructure, Cybersecurity
      violet: '#483698'       // Workforce, Orchestration, Memory
    },

    // Neutrals & Surface Colors (Section 2.3 of design.md)
    surface: {
      bg: '#FFFFFF',          // Primary card and modal background
      subtle: '#F5F6F8',      // App background, workspace canvas, table headers
      dark: '#0B0F19',        // Dark theme cards, code display background, console
      textPrimary: '#0B0F19', // High-contrast headline and body copy
      textSecondary: '#333333',// Subtitles, metadata copy
      textMuted: '#666666',   // Placeholders, timestamps, auxiliary labels
      borderSubtle: '#E0E0E0',// Card borders, dividers, table borders
      borderStrong: '#1E1E1E' // High-contrast borders
    }
  },

  // Geometry & Border Radii (Section 5 of design.md)
  radii: {
    container: '0px',         // Structural containers, layout blocks
    card: '0px',              // Information cards, node boxes
    button: '0px',            // Primary, secondary, and tertiary buttons
    input: '0px',             // Form inputs, textareas, selects
    pill: '9999px'            // Status badges, taxonomy tags, action chips only
  },

  // Typography Hierarchy (Section 3 of design.md)
  typography: {
    fontFamilies: {
      display: '"Univers", "Helvetica Neue", Arial, sans-serif',
      body: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
      mono: 'Consolas, Monaco, "Courier New", monospace'
    },
    sizes: {
      heroDisplay: '3.25rem', // 52px
      sectionH1: '2.5rem',    // 40px
      subheadingH2: '1.75rem',// 28px
      cardTitleH3: '1.25rem', // 20px
      eyebrow: '0.75rem',     // 12px uppercase bold
      lead: '1.125rem',       // 18px
      body: '0.9375rem',      // 15px
      caption: '0.75rem',     // 12px
      cta: '0.875rem'         // 14px semibold
    }
  },

  // Elevation & Shadows (Section 5 of design.md)
  shadows: {
    flat: 'none',
    cardHover: '0 4px 16px rgba(0, 0, 0, 0.08)',
    modal: '0 8px 32px rgba(0, 0, 0, 0.20)'
  }
};

/**
 * Standard Tailwind CSS class strings adhering strictly to design.md
 * Future screens and components should use these helper classes directly.
 */
export const DESIGN_CLASSES = {
  // Container & Card Classes
  card: 'bg-[#FFFFFF] border border-[#E0E0E0] rounded-none shadow-none',
  cardHover: 'transition-all duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:border-[#00338D]',
  
  // Headers & Subheaders
  screenHeader: 'bg-[#001E50] border-b border-[#00338D] text-white px-6 py-4 flex items-center justify-between',
  sectionTitle: 'text-sm font-bold text-[#0B0F19] tracking-wide',
  eyebrow: 'text-[10px] font-bold uppercase tracking-wider text-[#00338D] font-mono',
  
  // Buttons (Angular 0px)
  buttonPrimary: 'px-4 py-2 text-xs font-bold bg-[#00338D] text-white hover:bg-[#005EB8] rounded-none transition-colors shadow-sm',
  buttonSecondary: 'px-4 py-2 text-xs font-bold bg-[#FFFFFF] text-[#00338D] border border-[#00338D] hover:bg-[#F5F6F8] rounded-none transition-colors',
  buttonDanger: 'px-4 py-2 text-xs font-bold bg-[#6D2077] text-white hover:bg-[#470A68] rounded-none transition-colors',

  // Status & Taxonomy Pills (9999px Full Pill)
  statusPillActive: 'px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-[#E6F5EC] text-[#009A44] border border-[#009A44]/30',
  statusPillPending: 'px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-[#FEF6E6] text-[#EAAA00] border border-[#EAAA00]/30',
  statusPillAlert: 'px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-[#F2E9F4] text-[#6D2077] border border-[#6D2077]/30',
  statusPillBrand: 'px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-[#E6EDF7] text-[#00338D] border border-[#00338D]/20',

  // Form Controls
  input: 'w-full px-3 py-2 bg-[#F5F6F8] border border-[#E0E0E0] text-xs text-[#0B0F19] rounded-none focus:outline-none focus:border-[#00338D]',
  textarea: 'w-full p-3 bg-[#F5F6F8] border border-[#E0E0E0] text-xs text-[#0B0F19] rounded-none focus:outline-none focus:border-[#00338D] resize-none'
};
