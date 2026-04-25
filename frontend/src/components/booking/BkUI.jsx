/**
 * BkUI.jsx — Upgraded Tailwind-based UI primitives for Booking Module (Module B)
 *
 * Enhancements:
 *   - Buttons: softer gradients, floating hover lift, subtle shadow
 *   - Card: adds smooth hover transition, optional glass effect
 *   - Inputs: smoother focus ring with scale interaction
 *   - Labels: refined spacing and typography
 *   - Notifications: sleeker border and icon placements
 *
 * Exports remain identical to original.
 */

// ── Button base + variants + sizes ─────────────────────────────────────────

const BASE_BTN =
  'inline-flex items-center justify-center gap-1.5 font-semibold cursor-pointer ' +
  'whitespace-nowrap no-underline transition-all duration-200 focus:outline-none ' +
  'disabled:opacity-60 disabled:pointer-events-none select-none';

const BTN_VARIANTS = {
  primary:
    'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/20 ' +
    'hover:from-blue-700 hover:to-blue-600 hover:shadow-lg hover:shadow-blue-500/30 ' +
    'active:scale-[0.98]',
  success:
    'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md shadow-emerald-500/20 ' +
    'hover:from-emerald-700 hover:to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 ' +
    'active:scale-[0.98]',
  danger:
    'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-md shadow-red-500/20 ' +
    'hover:from-red-700 hover:to-rose-600 hover:shadow-lg hover:shadow-red-500/30 ' +
    'active:scale-[0.98]',
  outline:
    'bg-transparent border border-slate-300 text-slate-700 shadow-sm ' +
    'hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 hover:shadow-md ' +
    'active:scale-[0.98]',
  ghost:
    'bg-slate-100 text-slate-600 border-0 ' +
    'hover:bg-slate-200 hover:text-slate-800 active:scale-[0.98]',
};

const BTN_SIZES = {
  md: 'rounded-xl px-5 py-2.5 text-sm',
  sm: 'rounded-xl px-3.5 py-1.5 text-xs',
  xs: 'rounded-lg px-2.5 py-1 text-xs',
};

/** Returns Tailwind className string for button-styled elements. Works with <button> AND <Link>. */
export const btnCls = (variant = 'primary', size = 'md') =>
  `${BASE_BTN} ${BTN_VARIANTS[variant] ?? BTN_VARIANTS.primary} ${BTN_SIZES[size] ?? BTN_SIZES.md}`;

/** <button> element with variant + size props */
export function BkBtn({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  return (
    <button className={`${btnCls(variant, size)} ${className}`} {...props}>
      {children}
    </button>
  );
}

// ── Card ────────────────────────────────────────────────────────────────────

/** White rounded card container with subtle hover lift (optional glass effect via className) */
export function BkCard({ className = '', children, ...props }) {
  return (
    <div
      className={`bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// ── Form primitives ─────────────────────────────────────────────────────────

/** Returns Tailwind className for text inputs, selects, and textareas */
export const inputCls = (hasError = false) =>
  `w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 ease-in-out
  ${hasError
    ? 'border-red-400 ring-2 ring-red-100 bg-red-50/30'
    : 'border-slate-200 bg-white hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:bg-white'
  }`;

/** Compact variant of inputCls — for filter bars */
export const inputSmCls = (hasError = false) =>
  `w-full rounded-xl border px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 ease-in-out
  ${hasError
    ? 'border-red-400 ring-2 ring-red-100 bg-red-50/30'
    : 'border-slate-200 bg-white hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:bg-white'
  }`;

/** Form field label — renders a red asterisk when required=true */
export function BkLabel({ required = false, children }) {
  return (
    <label className="text-sm font-semibold text-slate-700 block mb-1">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

/** Inline field validation error (renders nothing when message is falsy) */
export function BkFieldError({ message }) {
  if (!message) return null;
  return <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><span>⚠</span> {message}</span>;
}

// ── Notifications ────────────────────────────────────────────────────────────

/** Server / API error alert (renders nothing when message is falsy) */
export function BkServerError({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-sm font-medium shadow-sm">
      <span className="text-lg">⚠️</span>
      <span>{message}</span>
    </div>
  );
}

/** Green success confirmation banner */
export function BkSuccessBanner({ icon = '✅', children }) {
  return (
    <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm shadow-sm">
      <span className="text-lg">{icon}</span>
      <div>{children}</div>
    </div>
  );
}