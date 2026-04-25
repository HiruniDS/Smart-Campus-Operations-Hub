/**
 * BkUI.jsx — Shared Tailwind-based UI primitives for Booking Module (Module B)
 *
 * Exports:
 *   btnCls(variant, size)  — returns Tailwind className string (use with <button> OR <Link>)
 *   BkBtn                  — <button> element with variant + size props
 *   BkCard                 — white rounded card container
 *   BkLabel                — form field label (supports required flag)
 *   BkFieldError           — inline validation error message
 *   inputCls(hasError)     — returns Tailwind className for inputs / selects / textareas
 *   inputSmCls(hasError)   — same but smaller padding (for filter bars)
 *   BkServerError          — server / API error alert banner
 *   BkSuccessBanner        — success confirmation banner
 */

// ── Button base + variants + sizes ─────────────────────────────────────────

const BASE_BTN =
    'inline-flex items-center justify-center gap-1.5 font-semibold cursor-pointer ' +
    'whitespace-nowrap no-underline transition-all focus:outline-none ' +
    'disabled:opacity-60 disabled:pointer-events-none';

const BTN_VARIANTS = {
    primary: 'bg-gradient-to-br from-blue-700 to-blue-600 text-white border-0 ' +
        'hover:from-blue-800 hover:to-blue-700',
    success: 'bg-gradient-to-br from-emerald-800 to-emerald-600 text-white border-0 ' +
        'hover:from-emerald-900 hover:to-emerald-700',
    danger: 'bg-gradient-to-br from-red-800 to-red-600 text-white border-0 ' +
        'hover:from-red-900 hover:to-red-700',
    outline: 'bg-transparent border border-slate-200 text-slate-600 ' +
        'hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50',
    ghost: 'bg-slate-100 text-slate-500 border-0 hover:bg-slate-200',
};

const BTN_SIZES = {
    md: 'rounded-xl px-4 py-2.5 text-sm',
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

/** White rounded card container */
export function BkCard({ className = '', children, ...props }) {
    return (
        <div
            className={`bg-white border border-slate-200 rounded-2xl shadow-sm ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}

// ── Form primitives ─────────────────────────────────────────────────────────

/** Returns Tailwind className for text inputs, selects, and textareas */
export const inputCls = (hasError = false) =>
    `w-full rounded-xl border ${hasError
        ? 'border-red-400 ring-2 ring-red-100'
        : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
    } bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-[border-color,box-shadow]`;

/** Compact variant of inputCls — for filter bars */
export const inputSmCls = (hasError = false) =>
    `w-full rounded-xl border ${hasError
        ? 'border-red-400 ring-2 ring-red-100'
        : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
    } bg-white px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-[border-color,box-shadow]`;

/** Form field label — renders a red asterisk when required=true */
export function BkLabel({ required = false, children }) {
    return (
        <label className="text-sm font-semibold text-slate-700 block">
            {children}
            {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
    );
}

/** Inline field validation error (renders nothing when message is falsy) */
export function BkFieldError({ message }) {
    if (!message) return null;
    return <span className="text-xs text-red-500">{message}</span>;
}

// ── Notifications ────────────────────────────────────────────────────────────

/** Server / API error alert (renders nothing when message is falsy) */
export function BkServerError({ message }) {
    if (!message) return null;
    return (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 rounded-xl px-5 py-3.5 text-sm font-medium">
            <span>⚠</span>
            <span>{message}</span>
        </div>
    );
}

/** Green success confirmation banner */
export function BkSuccessBanner({ icon = '✅', children }) {
    return (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl px-5 py-3.5 text-sm">
            <span className="text-lg">{icon}</span>
            <div>{children}</div>
        </div>
    );
}
