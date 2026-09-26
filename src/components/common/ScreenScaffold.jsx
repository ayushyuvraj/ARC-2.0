import React from 'react';
import { DESIGN_CLASSES } from '../../constants/designTokens';

/**
 * ScreenScaffold
 * Standard enterprise screen wrapper enforcing the KEAOS Design System (src/design.md).
 * 
 * Enforces:
 * - 0px angular border-radius consistency
 * - Unified header hierarchy with eyebrow and status pill
 * - Standardized CTA action slots
 * - Proper responsive gutter spacing
 * 
 * @param {string} title - Screen main title
 * @param {string} eyebrow - Uppercase category eyebrow label
 * @param {string} statusText - Text inside the header status pill
 * @param {'active'|'pending'|'alert'|'brand'|'dark'} statusType - Visual pill color
 * @param {React.ReactNode} actions - Optional button elements on the top-right
 * @param {React.ReactNode} children - Screen body contents
 */
export default function ScreenScaffold({
  title,
  eyebrow = 'ENTERPRISE AGENT STUDIO',
  statusText,
  statusType = 'brand',
  actions,
  children
}) {
  const getPillClass = () => {
    switch (statusType) {
      case 'active': return DESIGN_CLASSES.statusPillActive;
      case 'pending': return DESIGN_CLASSES.statusPillPending;
      case 'alert': return DESIGN_CLASSES.statusPillAlert;
      case 'dark': return DESIGN_CLASSES.statusPillDark;
      case 'brand':
      default: return DESIGN_CLASSES.statusPillBrand;
    }
  };

  return (
    <div className="flex-1 h-full bg-[#F8F9FB] flex flex-col overflow-hidden select-none">
      {/* Top Utility Header Bar (design.md Section 6.1) */}
      <div className="h-14 px-6 border-b border-[#CBD5E1] bg-[#FFFFFF] flex items-center justify-between shrink-0 shadow-[0_2px_8px_rgba(0,30,80,0.04)]">
        <div className="flex items-center gap-3">
          <div className="w-2 h-6 bg-[#00338D] shadow-inner" />
          <div>
            <span className={DESIGN_CLASSES.eyebrow}>
              {eyebrow}
            </span>
            <h2 className="text-sm font-bold text-[#0B0F19] tracking-tight">
              {title}
            </h2>
          </div>
          {statusText && (
            <span className={getPillClass()}>
              {statusText}
            </span>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Screen Body */}
      <div className="flex-1 overflow-auto p-6">
        {children}
      </div>
    </div>
  );
}
