import { btnCls } from './BkUI';

/** Centered spinner with a gradient track and smooth spin animation */
function Spinner() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer ring – gradient spin */}
      <div className="w-10 h-10 rounded-full border-[3px] border-transparent border-t-blue-500 border-r-blue-500/30 animate-spin" />
      {/* Inner subtle glow */}
      <div className="absolute inset-0 w-10 h-10 rounded-full border border-blue-100/60" />
    </div>
  );
}

export function LoadingState({ message = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center gap-4 py-14 text-center">
      <Spinner />
      <p className="text-sm font-medium text-slate-500 tracking-wide">{message}</p>
    </div>
  );
}

export function EmptyState({
  message = 'No bookings found.',
  icon = '📭',
}) {
  return (
    <div className="flex flex-col items-center gap-5 py-14 text-center">
      <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-100/80 border border-slate-200/60 shadow-sm">
        <span className="text-4xl">{icon}</span>
      </div>
      <p className="text-sm font-medium text-slate-500 max-w-xs">{message}</p>
    </div>
  );
}

export function ErrorState({
  message = 'Something went wrong.',
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center gap-5 py-14 text-center">
      <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-red-50 border border-red-200/70 shadow-sm">
        <span className="text-4xl">⚠️</span>
      </div>
      <p className="text-sm font-medium text-red-600 max-w-xs">{message}</p>
      {onRetry && (
        <button className={btnCls('outline', 'sm')} onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}