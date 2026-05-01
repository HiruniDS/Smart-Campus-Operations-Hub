import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface ModuleCardProps {
  title: string;
  description: string;
  path: string;
  accent: string;
  icon: ReactNode;
  bullets: string[];
}

export default function ModuleCard({ title, description, path, accent, icon, bullets }: ModuleCardProps) {
  return (
    <Link
      to={path}
      className="group relative overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/80 p-6 shadow-[0_18px_50px_-26px_rgba(15,23,42,0.45)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_rgba(15,23,42,0.55)]"
    >
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: accent }}
      />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
            Connected Module
          </p>
          <h3 className="text-2xl font-black tracking-tight text-slate-950">{title}</h3>
        </div>
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg"
          style={{ background: accent }}
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 text-sm font-medium leading-6 text-slate-600">{description}</p>

      <ul className="mt-5 space-y-2">
        {bullets.map((bullet) => (
          <li key={bullet} className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
            {bullet}
          </li>
        ))}
      </ul>

      <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-slate-950 transition-transform group-hover:translate-x-1">
        Open module
        <span aria-hidden>→</span>
      </div>
    </Link>
  );
}