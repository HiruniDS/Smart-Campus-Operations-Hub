import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { currentUser, loginAs, users } = useAuth();
  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <header className="topbar">
      <Link to="/" className="brand">
        Smart Campus Hub
      </Link>
      <nav className="navlinks">
        <NavLink to="/tickets">Tickets</NavLink>
        <NavLink to="/tickets/new">New Ticket</NavLink>
        <span className="nav-divider" />
        <NavLink to="/bookings">Bookings</NavLink>
        {!isAdmin && <NavLink to="/bookings/new">New Booking</NavLink>}
        {!isAdmin && <NavLink to="/bookings/me">My Bookings</NavLink>}
        {isAdmin && <NavLink to="/bookings/admin">Review Bookings</NavLink>}
        <NavLink to="/bookings/availability">Availability</NavLink>
      </nav>
      <div className="role-switcher">
        <label htmlFor="actor">Actor</label>
        <select
          id="actor"
          value={currentUser.username}
          onChange={(e) => loginAs(e.target.value)}
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
