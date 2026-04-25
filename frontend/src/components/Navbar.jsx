import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLink = ({ isActive }) =>
  `text-sm font-medium transition-colors no-underline ${isActive ? 'text-blue-300' : 'text-slate-300 hover:text-white'
  }`;

export default function Navbar() {
  const { currentUser, loginAs, users } = useAuth();
  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white px-6 h-14 flex items-center justify-between gap-4 shadow-md">
      <Link to="/" className="text-white font-bold text-base no-underline tracking-tight hover:text-blue-300 transition-colors shrink-0">
        Smart Campus Hub
      </Link>

      <nav className="flex items-center gap-5 flex-1 min-w-0">
        <NavLink to="/tickets" className={navLink}>Tickets</NavLink>
        <NavLink to="/tickets/new" className={navLink}>New Ticket</NavLink>

        {/* Divider */}
        <span className="w-px h-4 bg-white/20 mx-1 shrink-0" />

        <NavLink to="/bookings" className={navLink}>Bookings</NavLink>
        {!isAdmin && <NavLink to="/bookings/new" className={navLink}>New Booking</NavLink>}
        {!isAdmin && <NavLink to="/bookings/me" className={navLink}>My Bookings</NavLink>}
        {isAdmin && <NavLink to="/bookings/admin" className={navLink}>Review Bookings</NavLink>}
        <NavLink to="/bookings/availability" className={navLink}>Availability</NavLink>
      </nav>

      <div className="flex items-center gap-2 shrink-0">
        <label htmlFor="actor" className="text-xs text-slate-400 font-medium">Actor</label>
        <select
          id="actor"
          value={currentUser.username}
          onChange={(e) => loginAs(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-[border-color]"
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
