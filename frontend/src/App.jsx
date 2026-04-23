import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import { setBasicAuth } from './api/client';
import { useAuth } from './context/AuthContext';
import CreateTicketPage from './pages/CreateTicketPage';
import TicketDetailsPage from './pages/TicketDetailsPage';
import TicketListPage from './pages/TicketListPage';

export default function App() {
  const { currentUser } = useAuth();

  setBasicAuth(currentUser.username, currentUser.password);

  return (
    <div className="app-shell">
      <Navbar />
      <main className="layout">
        <Routes>
          <Route path="/" element={<Navigate to="/tickets" replace />} />
          <Route path="/tickets" element={<TicketListPage />} />
          <Route path="/tickets/new" element={<CreateTicketPage />} />
          <Route path="/tickets/:id" element={<TicketDetailsPage />} />
        </Routes>
      </main>
    </div>
  );
}
