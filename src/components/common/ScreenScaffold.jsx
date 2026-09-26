import React from 'react';
import { DESIGN_CLASSES } from '../../constants/designTokens';

/**
 * ScreenScaffold
 * Standard institutional screen wrapper adhering strictly to KEAOS Design System (src/design.md)
 * and Impeccable craft floor standards.
 */
export default function ScreenScaffold({
  title,
  subtitle,
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
    <div className="flex-1 h-full bg-[#F5F6F8] flex flex-col overflow-hidden select-none">
      {/* Institutional Top Header Bar */}
      <div className="h-16 px-6 border-b border-[#CBD5E1] bg-[#FFFFFF] flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-base font-bold text-[#0B0F19] tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {statusText && (
            <span className={getPillClass()}>
              {statusText}
            </span>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2.5">
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
