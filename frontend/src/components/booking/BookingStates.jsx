import { btnCls } from './BkUI';

export function LoadingState({ message = 'Loading…' }) {
    return (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="w-9 h-9 border-[3px] border-slate-200 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-slate-500 text-sm m-0">{message}</p>
        </div>
    );
}

export function EmptyState({ message = 'No bookings found.', icon = '📭' }) {
    return (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="text-4xl">{icon}</div>
            <p className="text-slate-500 text-sm m-0">{message}</p>
        </div>
    );
}

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
    return (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="text-4xl">⚠️</div>
            <p className="text-red-600 text-sm m-0">{message}</p>
            {onRetry && (
                <button className={btnCls('outline', 'sm')} onClick={onRetry}>
                    Try Again
                </button>
            )}
        </div>
    );
}
