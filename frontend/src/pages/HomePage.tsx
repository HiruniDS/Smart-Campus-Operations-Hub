import { motion } from 'motion/react';
import { ArrowRight, Building2, CalendarDays, ShieldCheck, Ticket, Megaphone, Users, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ModuleCard from '@/components/home/ModuleCard';

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();

  const modules = [
    {
      title: 'Facilities Catalogue',
      path: '/dashboard/facilities',
      accent: 'linear-gradient(135deg, #0f766e, #14b8a6)',
      icon: <Building2 className="h-5 w-5" />,
      description: 'Browse rooms, labs, and bookable spaces with clean filters and ready-to-book actions.',
      bullets: ['Resource catalogue', 'Search and filter', 'Booking entry point'],
    },
    {
      title: 'Booking Workflow',
      path: '/dashboard/bookings',
      accent: 'linear-gradient(135deg, #1d4ed8, #6366f1)',
      icon: <CalendarDays className="h-5 w-5" />,
      description: 'Create booking requests, check for conflicts, and review approvals from one place.',
      bullets: ['Time-slot conflict checks', 'Approval queue', 'My bookings view'],
    },
    {
      title: 'Incident Tickets',
      path: '/dashboard/tickets',
      accent: 'linear-gradient(135deg, #b45309, #f59e0b)',
      icon: <Ticket className="h-5 w-5" />,
      description: 'Track maintenance incidents, attachments, comments, and technician assignments.',
      bullets: ['Ticket creation', 'Attachment upload', 'Status updates'],
    },
    {
      title: 'Notices & Users',
      path: '/dashboard/notices',
      accent: 'linear-gradient(135deg, #be185d, #ec4899)',
      icon: <Megaphone className="h-5 w-5" />,
      description: 'Publish notices, manage roles, and keep the campus informed through the same shell.',
      bullets: ['Admin notices', 'Role management', 'Notification panel'],
    },
  ];

  const roleLabel = user ? `${user.role} access` : 'Guest access';

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_34%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-950">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-pink-500" />
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-10">
        <header className="flex flex-col gap-6 rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-[0_24px_70px_-32px_rgba(15,23,42,0.35)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-blue-700">
              <Sparkles className="h-3.5 w-3.5" />
              Merged campus hub
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              SmartCampus operations, merged into one working surface.
            </h1>
            <p className="max-w-2xl text-base font-medium leading-7 text-slate-600 sm:text-lg">
              Facilities, bookings, tickets, notices, and user administration now live in one place.
              This home screen acts as the merge hub, while the protected dashboard holds the operational tools.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-600">
              <span className="rounded-full bg-slate-900 px-3 py-1.5 text-white">{roleLabel}</span>
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">Routing fixed</span>
              <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">Component folder visible</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-900/20 lg:w-80">
            <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-slate-300">
              <ShieldCheck className="h-4 w-4 text-blue-300" />
              Ready to continue
            </div>
            <p className="text-sm leading-6 text-slate-300">
              Sign in to access the dashboard, or open the module routes directly from the cards below.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to={isAuthenticated ? '/dashboard' : '/login'}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 transition-transform hover:-translate-y-0.5"
              >
                {isAuthenticated ? 'Open dashboard' : 'Sign in'}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Create account
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 py-10">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {modules.map((module, index) => (
              <motion.div
                key={module.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <ModuleCard {...module} />
              </motion.div>
            ))}
          </div>

          <section className="mt-10 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[2rem] border border-white/70 bg-white/75 p-8 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.4)] backdrop-blur-xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">What merged here</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {[
                  ['Member 1', 'Facilities catalogue and resource management'],
                  ['Member 2', 'Booking workflow and conflict checking'],
                  ['Member 3', 'Incident tickets with comments and attachments'],
                  ['Member 4', 'Notifications, auth, roles, and dashboard shell'],
                ].map(([label, text]) => (
                  <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">{label}</p>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_20px_50px_-30px_rgba(15,23,42,0.6)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Quick path</p>
              <h2 className="mt-3 text-2xl font-black tracking-tight">Open the dashboard after login.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                The authenticated dashboard keeps the operational modules together and exposes the component tree clearly.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 transition-transform hover:-translate-y-0.5"
                >
                  Dashboard overview
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/dashboard/bookings"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Bookings module
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}