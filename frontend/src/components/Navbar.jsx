import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── Reusable nav link class builder ─────────────────
const getNavLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-all duration-200 no-underline relative px-2 py-1 rounded-lg ${
    isActive
      ? 'text-white bg-white/10'
      : 'text-slate-300 hover:text-white hover:bg-white/5'
  }`;

export default function Navbar() {
  const { currentUser, loginAs, users } = useAuth();
  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 text-white px-6 h-14 flex items-center justify-between gap-4 shadow-lg shadow-black/10 backdrop-blur-md bg-opacity-90 border-b border-white/5">
      {/* Brand */}
      <Link
        to="/"
        className="text-white font-bold text-lg no-underline tracking-tight hover:text-blue-400 transition-colors shrink-0 flex items-center gap-1.5"
      >
        <span className="text-xl">🏫</span>
        <span>Smart Campus Hub</span>
      </Link>

      {/* Navigation */}
      <nav className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto">
        <NavLink to="/tickets" className={getNavLinkClass}>
          Tickets
        </NavLink>
        <NavLink to="/tickets/new" className={getNavLinkClass}>
          New Ticket
        </NavLink>

        {/* Divider */}
        <span className="w-px h-5 bg-white/15 mx-2 shrink-0" />

        <NavLink to="/bookings" className={getNavLinkClass}>
          Bookings
        </NavLink>
        {!isAdmin && (
          <NavLink to="/bookings/new" className={getNavLinkClass}>
            New Booking
          </NavLink>
        )}
        {!isAdmin && (
          <NavLink to="/bookings/me" className={getNavLinkClass}>
            My Bookings
          </NavLink>
        )}
        {isAdmin && (
          <NavLink to="/bookings/admin" className={getNavLinkClass}>
            Review Bookings
          </NavLink>
        )}
        <NavLink to="/bookings/availability" className={getNavLinkClass}>
          Availability
        </NavLink>
      </nav>

      {/* User switcher */}
      <div className="flex items-center gap-2 shrink-0">
        <label htmlFor="actor" className="text-xs text-slate-400 font-medium hidden sm:inline">
          Actor
        </label>
        <select
          id="actor"
          value={currentUser.username}
          onChange={(e) => loginAs(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer hover:border-slate-600"
        >
          {users.map((user) => (
            <option key={user.username} value={user.username}>
              {user.username} ({user.role})
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}