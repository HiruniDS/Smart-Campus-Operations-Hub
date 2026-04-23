import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { currentUser, loginAs, users } = useAuth();

  return (
    <header className="topbar">
      <Link to="/" className="brand">
        Smart Campus Operations Hub
      </Link>
      <nav className="navlinks">
        <NavLink to="/tickets">Tickets</NavLink>
        <NavLink to="/tickets/new">Create Ticket</NavLink>
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
