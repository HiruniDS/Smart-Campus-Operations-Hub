import { useEffect, useRef } from 'react';

/* ── Keyframes injected into the document once (if not already present) ── */
const animationStyles = `
  @keyframes bkFadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes bkSlideUp { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
`;

let styleTag = null;
function ensureAnimationStyles() {
  if (typeof document !== 'undefined' && !styleTag) {
    // Check if already added by another instance
    if (!document.getElementById('bk-modal-styles')) {
      styleTag = document.createElement('style');
      styleTag.id = 'bk-modal-styles';
      styleTag.textContent = animationStyles;
      document.head.appendChild(styleTag);
    }
  }
}

export default function BookingModal({ title, onClose, children, maxWidth = 520 }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    ensureAnimationStyles();
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
      style={{ animation: 'bkFadeIn 0.2s ease-out' }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 w-full overflow-hidden"
        style={{
          maxWidth,
          animation: 'bkSlideUp 0.25s ease-out',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 m-0 leading-6">
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="group flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:scale-110 transition-transform"
            >
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>
        </div>

        {/* Body – flexible spacing */}
        <div className="px-6 py-5 flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-180px)]">
          {children}
        </div>
      </div>
    </div>
  );
}