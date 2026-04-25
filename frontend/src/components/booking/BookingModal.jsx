import { useEffect, useRef } from 'react';

export default function BookingModal({ title, onClose, children, maxWidth = 520 }) {
    const overlayRef = useRef(null);

    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    return (
        <div
            ref={overlayRef}
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-[bk-fade-in_0.2s_ease]"
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full animate-[bk-slide-up_0.2s_ease]"
                style={{ maxWidth }}
            >
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-900 m-0">{title}</h3>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="bg-transparent border-0 text-slate-400 cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                        ✕
                    </button>
                </div>
                <div className="px-6 py-5 flex flex-col gap-4">{children}</div>
            </div>
        </div>
    );
}
