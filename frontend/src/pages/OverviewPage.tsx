import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Building2, Clock, AlertCircle, Activity,
  Plus, ArrowRight, CalendarDays, Ticket,
  Users, CheckCircle2, Circle,
} from 'lucide-react';

/* ─── Inline styles ───────────────────────────────────────── */
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
  .ov-root { font-family: 'Outfit', ui-sans-serif, system-ui, sans-serif; }
  @keyframes ovFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .ov-u0 { animation: ovFadeUp .35s ease both; }
  .ov-u1 { animation: ovFadeUp .35s .07s ease both; }
  .ov-u2 { animation: ovFadeUp .35s .14s ease both; }
  .ov-u3 { animation: ovFadeUp .35s .21s ease both; }

  .ov-stat-card {
    background: #fff; border: 1px solid rgba(0,0,0,0.07);
    border-radius: 18px; padding: 22px 24px;
    transition: transform .2s, box-shadow .2s;
  }
  .ov-stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }

  .ov-activity-row {
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; padding: 14px 22px;
    border-bottom: 1px solid #F5F3EE;
    transition: background .15s;
  }
  .ov-activity-row:last-child { border-bottom: none; }
  .ov-activity-row:hover { background: #FAFAF8; }

  .ov-quick-link {
    display: flex; align-items: center; justify-content: space-between;
    gap: 10px; padding: 13px 16px; border-radius: 12px;
    text-decoration: none; transition: background .15s, transform .15s;
    border: 1px solid transparent;
  }
  .ov-quick-link:hover {
    background: #fff;
    border-color: rgba(0,0,0,0.07);
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    transform: translateX(2px);
  }

  .ov-cta {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 22px; border-radius: 12px; cursor: pointer; border: none;
    font-size: 13px; font-weight: 700; color: #fff; font-family: inherit;
    background: linear-gradient(135deg, #10B981, #059669);
    box-shadow: 0 4px 14px rgba(16,185,129,0.32);
    transition: filter .15s, transform .15s; text-decoration: none;
  }
  .ov-cta:hover { filter: brightness(1.08); transform: translateY(-1px); }
`;

/* ─── Stat card data ──────────────────────────────────────── */
const STATS = [
  { label: 'Total Resources', value: '142', badge: '+12%',           badgeBg: '#F0FDF4', badgeText: '#059669', icon: Building2, iconBg: '#F0FDF4', iconColor: '#059669' },
  { label: 'Active Bookings', value: '48',  badge: '89% capacity',   badgeBg: '#EFF6FF', badgeText: '#2563EB', icon: Clock,     iconBg: '#EFF6FF', iconColor: '#2563EB' },
  { label: 'Open Incidents',  value: '12',  badge: '-2 this week',   badgeBg: '#FFF1F2', badgeText: '#E11D48', icon: AlertCircle,iconBg: '#FFF1F2',iconColor: '#E11D48' },
  { label: 'System Uptime',   value: '99.9%', badge: 'All systems go', badgeBg: '#F0FDF4', badgeText: '#059669', icon: Activity,  iconBg: '#FFFBEB', iconColor: '#D97706' },
];

/* ─── Recent activity (static placeholder) ───────────────── */
const ACTIVITIES = [
  { id: 1, user: 'John Doe',    action: 'booked',    target: 'Lab 402',               time: '12m ago', status: 'confirmed' },
  { id: 2, user: 'Sarah Smith', action: 'reported',  target: 'AC Fault - Floor 2',    time: '45m ago', status: 'pending' },
  { id: 3, user: 'System',      action: 'optimized', target: 'Energy usage - Zone B', time: '2h ago',  status: 'success' },
];

const STATUS_CFG: Record<string, { bg: string; text: string; dot: string }> = {
  confirmed: { bg: '#EFF6FF', text: '#2563EB', dot: '#3B82F6' },
  pending:   { bg: '#FFFBEB', text: '#D97706', dot: '#F59E0B' },
  success:   { bg: '#F0FDF4', text: '#059669', dot: '#22C55E' },
};

/* ─── Quick links ─────────────────────────────────────────── */
const QUICK_LINKS = [
  { label: 'New Booking',       sub: 'Request a campus resource',   path: '/bookings/new',            icon: CalendarDays, iconBg: '#F0FDF4',  iconColor: '#059669' },
  { label: 'Check Availability', sub: 'See open time slots',        path: '/bookings/availability',   icon: Clock,        iconBg: '#EFF6FF',  iconColor: '#2563EB' },
  { label: 'My Bookings',       sub: 'View your booking history',   path: '/bookings/me',             icon: Building2,    iconBg: '#F5F3FF',  iconColor: '#7C3AED' },
  { label: 'Raise a Ticket',    sub: 'Report an incident',          path: '/tickets',                 icon: Ticket,       iconBg: '#FFF1F2',  iconColor: '#E11D48' },
];

/* ── Admin-only quick links ── */
const ADMIN_LINKS = [
  { label: 'Review Bookings',   sub: 'Approve or reject requests',  path: '/bookings/admin',          icon: CheckCircle2, iconBg: '#F0FDF4',  iconColor: '#059669' },
  { label: 'User Management',   sub: 'Manage roles and accounts',   path: '/dashboard/users',         icon: Users,        iconBg: '#FFFBEB',  iconColor: '#D97706' },
];

/* ══════════════════════════════════════════════════════════
   PAGE COMPONENT
══════════════════════════════════════════════════════════ */
export default function OverviewPage() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const isAdmin   = user?.role === 'ADMIN';
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  const quickLinks = isAdmin ? [...QUICK_LINKS, ...ADMIN_LINKS] : QUICK_LINKS;

  return (
    <div className="ov-root min-h-screen" style={{ background: '#E9E5DC' }}>
      <style>{STYLE}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">

        {/* ── Breadcrumb ─────────────────────────────── */}
        <nav className="ov-u0 flex items-center gap-1.5 text-xs mb-6">
          <span style={{ color: '#9CA3AF' }} className="font-semibold uppercase tracking-widest">Operations</span>
          <span style={{ color: '#9CA3AF' }}>›</span>
          <span style={{ color: '#6B7280' }} className="font-medium">Dashboard</span>
        </nav>

        {/* ── HERO ───────────────────────────────────── */}
        <div className="ov-u0 relative overflow-hidden rounded-2xl mb-6"
          style={{ background: '#0C1D11' }}>

          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }} />
          <div className="absolute inset-x-0 top-0 h-[3px]"
            style={{ background: 'linear-gradient(90deg, #10B981 0%, #34D399 50%, #059669 100%)' }} />
          <div className="absolute -top-24 -left-16 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)' }} />
          <div className="absolute bottom-0 right-48 w-56 h-56 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.06), transparent 70%)' }} />

          <div className="relative px-8 py-9 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-4"
                style={{ background: 'rgba(16,185,129,0.14)', color: '#34D399' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Operational Insight
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-2"
                style={{ color: '#F0FDF4' }}>
                {greeting}, {firstName}
              </h1>
              <p className="text-sm" style={{ color: '#9CA3AF', lineHeight: 1.7 }}>
                Here's what's happening across the campus today.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 shrink-0">
              <Link to="/bookings/new" className="ov-cta">
                <Plus className="h-4 w-4" /> New Booking
              </Link>
              {isAdmin && (
                <Link to="/bookings/admin"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5"
                  style={{ background: 'rgba(255,255,255,0.07)', color: '#E5E7EB', border: '1px solid rgba(255,255,255,0.12)', textDecoration: 'none' }}>
                  Review Bookings →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats strip ────────────────────────────── */}
        <div className="ov-u1 grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {STATS.map(({ label, value, badge, badgeBg, badgeText, icon: Icon, iconBg, iconColor }) => (
            <div key={label} className="ov-stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon className="h-4 w-4" style={{ color: iconColor }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 800, background: badgeBg, color: badgeText, padding: '3px 8px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {badge}
                </span>
              </div>
              <p style={{ fontSize: 10, fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 4 }}>
                {label}
              </p>
              <p style={{ fontSize: 30, fontWeight: 800, color: '#0C1D11', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Main grid ──────────────────────────────── */}
        <div className="ov-u2 grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* ── Recent Activity — 2/3 width ── */}
          <div className="xl:col-span-2 rounded-2xl bg-white overflow-hidden"
            style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

            {/* header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', borderBottom: '1px solid #F0EDE6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 3, height: 16, borderRadius: 99, background: '#10B981' }} />
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity className="h-3.5 w-3.5" style={{ color: '#10B981' }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#374151' }}>
                  Recent Activity
                </span>
              </div>
              <Link to="/bookings/me"
                style={{ fontSize: 12, fontWeight: 700, color: '#059669', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                className="hover:opacity-70 transition-opacity">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* rows */}
            {ACTIVITIES.map((activity) => {
              const cfg = STATUS_CFG[activity.status] ?? STATUS_CFG.pending;
              return (
                <div key={activity.id} className="ov-activity-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* avatar */}
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 13,
                      background: cfg.bg, color: cfg.text,
                    }}>
                      {activity.user.charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', lineHeight: 1.3 }}>
                        <strong>{activity.user}</strong>{' '}
                        <span style={{ fontWeight: 400, color: '#6B7280' }}>{activity.action}</span>{' '}
                        <strong style={{ color: '#059669' }}>{activity.target}</strong>
                      </p>
                      <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{activity.time}</p>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em',
                    padding: '3px 10px', borderRadius: 99,
                    background: cfg.bg, color: cfg.text,
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    flexShrink: 0,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
                    {activity.status}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ── Right column ── */}
          <div className="xl:col-span-1 flex flex-col gap-5">

            {/* Quick Actions card */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: '#0C1D11', border: '1px solid rgba(255,255,255,0.08)' }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 22px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ width: 3, height: 16, borderRadius: 99, background: '#10B981' }} />
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#6EE7B7' }}>
                  Quick Actions
                </span>
              </div>

              <div style={{ padding: '12px' }}>
                {quickLinks.map(({ label, sub, path, icon: Icon, iconBg, iconColor }) => (
                  <Link key={path} to={path} className="ov-quick-link"
                    style={{ textDecoration: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 9, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon className="h-3.5 w-3.5" style={{ color: iconColor }} />
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#F0FDF4', marginBottom: 1 }}>{label}</p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{sub}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }} />
                  </Link>
                ))}
              </div>
            </div>

            {/* How it works card */}
            <div className="rounded-2xl p-5 bg-white"
              style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center gap-2 mb-4">
                <div style={{ width: 3, height: 14, borderRadius: 99, background: '#10B981' }} />
                <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#374151', margin: 0 }}>
                  Quick Guide
                </p>
              </div>
              <div className="space-y-4">
                {[
                  { n: '01', t: 'Browse available campus facilities and check real-time availability.' },
                  { n: '02', t: 'Submit a booking request — an admin will review and confirm it.' },
                  { n: '03', t: 'Report incidents or maintenance issues via the tickets module.' },
                ].map(({ n, t }) => (
                  <div key={n} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#10B981', flexShrink: 0, paddingTop: 1 }}>{n}</span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(16,185,129,0.15)', marginTop: 9 }} />
                    <p style={{ flex: 5, fontSize: 12, color: '#6B7280', lineHeight: 1.6 }}>{t}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}