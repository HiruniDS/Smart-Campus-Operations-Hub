export function LoadingState({ message = 'Loading...' }) {
    return (
        <div className="bk-state-box">
            <div className="bk-spinner" />
            <p className="bk-state-text">{message}</p>
        </div>
    );
}

export function EmptyState({ message = 'No bookings found.', icon = '📭' }) {
    return (
        <div className="bk-state-box">
            <div className="bk-state-icon">{icon}</div>
            <p className="bk-state-text">{message}</p>
        </div>
    );
}

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
    return (
        <div className="bk-state-box bk-state-error">
            <div className="bk-state-icon">⚠️</div>
            <p className="bk-state-text">{message}</p>
            {onRetry && (
                <button className="bk-btn bk-btn-outline" onClick={onRetry}>
                    Try Again
                </button>
            )}
        </div>
    );
}
