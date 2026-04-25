import { useEffect, useRef } from 'react';

export default function BookingModal({ title, onClose, children, maxWidth = 520 }) {
    const overlayRef = useRef(null);

    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    const handleOverlayClick = (e) => {
        if (e.target === overlayRef.current) onClose();
    };

    return (
        <div className="bk-modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
            <div className="bk-modal-box" style={{ maxWidth }}>
                <div className="bk-modal-header">
                    <h3 className="bk-modal-title">{title}</h3>
                    <button className="bk-modal-close" onClick={onClose} aria-label="Close">✕</button>
                </div>
                <div className="bk-modal-body">{children}</div>
            </div>
        </div>
    );
}
