import React from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, CalendarDays, Building2, Ticket,
  Users, Bell, Settings, LogOut, Menu, Search,
  HelpCircle, User as UserIcon, ChevronDown, Megaphone, X,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import NotificationPanel from './NotificationPanel';
import api from '@/lib/api';

/* ─── Inline styles ───────────────────────────────────────── */
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
  .dl-root { font-family: 'Outfit', ui-sans-serif, system-ui, sans-serif; }

  /* Nav link */
  .dl-nav-link {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 6px 12px; border-radius: 10px; text-decoration: none;
    font-size: 12px; font-weight: 700; letter-spacing: 0.04em;
    color: rgba(255,255,255,0.55);
    transition: background .15s, color .15s;
    white-space: nowrap;
  }
  .dl-nav-link:hover { background: rgba(255,255,255,0.08); color: #fff; }
  .dl-nav-link.active {
    background: rgba(16,185,129,0.18);
    color: #6EE7B7;
  }
  .dl-nav-link .dl-nav-icon { opacity: 0.6; transition: opacity .15s; }
  .dl-nav-link:hover .dl-nav-icon,
  .dl-nav-link.active .dl-nav-icon { opacity: 1; }

  /* Search */
  .dl-search {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 14px; border-radius: 10px;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.1);
    transition: background .15s, border-color .15s, width .2s;
    width: 200px;
  }
  .dl-search:focus-within {
    background: rgba(255,255,255,0.12);
    border-color: rgba(16,185,129,0.4);
    width: 260px;
  }
  .dl-search input {
    background: transparent; border: none; outline: none;
    font-size: 12px; font-weight: 600; color: #fff;
    width: 100%; font-family: inherit;
  }
  .dl-search input::placeholder { color: rgba(255,255,255,0.35); }

  /* Bell button */
  .dl-bell {
    width: 36px; height: 36px; border-radius: 10px; cursor: pointer; border: none;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.6);
    transition: background .15s, color .15s;
    position: relative;
  }
  .dl-bell:hover { background: rgba(255,255,255,0.13); color: #fff; }

  /* Mobile drawer */
  .dl-drawer {
    position: fixed; inset: 0; z-index: 50;
    display: flex;
  }
  .dl-drawer-backdrop {
    position: absolute; inset: 0;
    background: rgba(12,29,17,0.65);
    backdrop-filter: blur(4px);
  }
  .dl-drawer-panel {
    position: relative; z-index: 1;
    width: 280px; height: 100%;
    background: #0C1D11;
    border-right: 1px solid rgba(255,255,255,0.08);
    overflow-y: auto;
    display: flex; flex-direction: column;
  }

  /* Mobile nav link */
  .dl-mob-link {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 16px; border-radius: 12px;
    font-size: 13px; font-weight: 700; text-decoration: none;
    color: rgba(255,255,255,0.6);
    transition: background .15s, color .15s;
  }
  .dl-mob-link:hover { background: rgba(255,255,255,0.07); color: #fff; }
  .dl-mob-link.active { background: rgba(16,185,129,0.18); color: #6EE7B7; }
`;

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [unreadCount,         setUnreadCount]         = React.useState(0);
  const [mobileOpen,          setMobileOpen]          = React.useState(false);

  /* ── Unread notification polling ── */
  const fetchUnreadCount = React.useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/notifications/${user.id}/unread-count`);
      setUnreadCount(res.data);
    } catch { /* silent */ }
  }, [user?.id]);

  React.useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30_000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const handleLogout = () => { logout(); navigate('/login'); };

  /* ── Menu items ── */
  const menuItems = [
    { label: 'Overview',            icon: LayoutDashboard, path: '/dashboard',          roles: ['USER', 'ADMIN', 'TECHNICIAN'] },
    { label: 'Facilities',          icon: Building2,       path: '/dashboard/facilities', roles: ['USER', 'ADMIN', 'TECHNICIAN'] },
    { label: 'Facility Bookings',   icon: CalendarDays,    path: '/bookings',            roles: ['USER', 'ADMIN'] },
    { label: 'Maintenance Tickets', icon: Ticket,          path: '/tickets',             roles: ['TECHNICIAN', 'ADMIN', 'USER'] },
    { label: 'System Notices',      icon: Megaphone,       path: '/dashboard/notices',   roles: ['ADMIN'] },
    { label: 'User Management',     icon: Users,           path: '/dashboard/users',     roles: ['ADMIN'] },
  ];

  const filteredMenu = menuItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  const isActive = (path: string) =>
    path === '/dashboard' ? location.pathname === path : location.pathname.startsWith(path);

  /* ── User initials ── */
  const initials = user?.name?.charAt(0).toUpperCase() ?? 'U';

  return (
    <div className="dl-root flex flex-col min-h-screen" style={{ background: '#E9E5DC' }}>
      <style>{STYLE}</style>

      {/* ╔══════════════════════════════════════════════╗
          ║               TOP NAVBAR                    ║
          ╚══════════════════════════════════════════════╝ */}
      <header className="sticky top-0 z-30" style={{ background: '#0C1D11' }}>

        {/* emerald top accent stripe */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, #10B981 0%, #34D399 50%, #059669 100%)' }} />

        {/* dot-grid texture overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '22px 22px', top: 3,
        }} />

        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* ── Logo ── */}
          <Link to="/dashboard" className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm"
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff', boxShadow: '0 0 0 2px rgba(16,185,129,0.3)' }}>
              SC
            </div>
            <span className="hidden sm:block text-base font-extrabold tracking-tight" style={{ color: '#F0FDF4' }}>
              SmartCampus<span style={{ color: '#10B981' }}>.</span>
            </span>
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 ml-4">
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', marginRight: 8 }} />
            {filteredMenu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`dl-nav-link ${isActive(item.path) ? 'active' : ''}`}
              >
                <item.icon className="dl-nav-icon h-3.5 w-3.5" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* ── Right controls ── */}
          <div className="flex items-center gap-2 shrink-0">

            {/* search */}
            <div className="dl-search hidden md:flex">
              <Search className="h-3.5 w-3.5" style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
              <input type="text" placeholder="Search resources…" />
            </div>

            {/* notification bell */}
            <button className="dl-bell" onClick={() => setIsNotificationsOpen(true)}>
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  width: 18, height: 18, borderRadius: '50%',
                  background: '#10B981', color: '#fff',
                  fontSize: 10, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #0C1D11',
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <NotificationPanel
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
            />

            {/* user dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div role="button"
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl cursor-pointer outline-none transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback style={{ background: 'linear-gradient(135deg,#10B981,#059669)', color: '#fff', fontSize: 12, fontWeight: 800 }}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block text-left">
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#F0FDF4', lineHeight: 1.2 }}>{user?.name}</p>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#6EE7B7', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {user?.role}
                    </p>
                  </div>
                  <ChevronDown className="h-3 w-3 hidden lg:block" style={{ color: 'rgba(255,255,255,0.4)' }} />
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 mt-2 p-2 rounded-2xl border-slate-200 shadow-2xl" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-3 py-2">
                    <p style={{ fontSize: 10, fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 2 }}>
                      Signed in as
                    </p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{user?.email}</p>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem className="rounded-xl py-2 cursor-pointer focus:bg-slate-50">
                  <UserIcon className="mr-3 h-4 w-4 text-slate-400" />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl py-2 cursor-pointer focus:bg-slate-50">
                  <Settings className="mr-3 h-4 w-4 text-slate-400" />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl py-2 cursor-pointer focus:bg-slate-50">
                  <HelpCircle className="mr-3 h-4 w-4 text-slate-400" />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Support</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem onClick={handleLogout}
                  className="rounded-xl py-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                  <LogOut className="mr-3 h-4 w-4" />
                  <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* mobile hamburger */}
            <button className="lg:hidden dl-bell" onClick={() => setMobileOpen(true)}>
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="dl-drawer">
          <div className="dl-drawer-backdrop" onClick={() => setMobileOpen(false)} />
          <div className="dl-drawer-panel">

            {/* drawer header */}
            <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#F0FDF4' }}>
                SmartCampus<span style={{ color: '#10B981' }}>.</span>
              </span>
              <button onClick={() => setMobileOpen(false)}
                style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}>
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* user info strip */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#10B981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#fff', flexShrink: 0 }}>
                {initials}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#F0FDF4', marginBottom: 1 }}>{user?.name}</p>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#6EE7B7', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{user?.role}</p>
              </div>
            </div>

            {/* nav links */}
            <div style={{ padding: '12px 12px', flex: 1 }}>
              <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', padding: '6px 8px 10px' }}>
                Navigation
              </p>
              {filteredMenu.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`dl-mob-link ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>

            {/* logout */}
            <div style={{ padding: '12px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button onClick={handleLogout}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: 'rgba(225,29,72,0.1)', color: '#FB7185',
                  fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                }}>
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ╔══════════════════════════════════════════════╗
          ║               PAGE CONTENT                  ║
          ╚══════════════════════════════════════════════╝ */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Minimal footer ── */}
      <footer style={{
        borderTop: '1px solid rgba(0,0,0,0.07)',
        background: '#fff',
        padding: '14px 24px',
      }}>
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <span style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
            SmartCampus Operations Platform
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px rgba(16,185,129,0.5)', display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
              All systems operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}