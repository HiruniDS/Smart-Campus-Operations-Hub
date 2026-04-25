import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import { setBasicAuth } from './api/client';
import { useAuth } from './context/AuthContext';
import CreateTicketPage from './pages/CreateTicketPage';
import TicketDetailsPage from './pages/TicketDetailsPage';
import TicketListPage from './pages/TicketListPage';
import BookingDashboardPage from './pages/booking/BookingDashboardPage';
import CreateBookingPage from './pages/booking/CreateBookingPage';
import MyBookingsPage from './pages/booking/MyBookingsPage';
import BookingDetailsPage from './pages/booking/BookingDetailsPage';
import AdminBookingReviewPage from './pages/booking/AdminBookingReviewPage';
import AvailabilityViewPage from './pages/booking/AvailabilityViewPage';

export default function App() {
  const { currentUser } = useAuth();
  const { pathname } = useLocation();

  setBasicAuth(currentUser.username, currentUser.password);

  return (
    <div className="app-shell">
      <Navbar />
      <div className={pathname.startsWith('/bookings') ? 'bk-app-bg' : ''}>
        <main className={pathname.startsWith('/bookings') ? 'layout-booking' : 'layout'}>
          <Routes>
            <Route path="/" element={<Navigate to="/tickets" replace />} />
            <Route path="/tickets" element={<TicketListPage />} />
            <Route path="/tickets/new" element={<CreateTicketPage />} />
            <Route path="/tickets/:id" element={<TicketDetailsPage />} />
            <Route path="/bookings" element={<BookingDashboardPage />} />
            <Route path="/bookings/new" element={<CreateBookingPage />} />
            <Route path="/bookings/me" element={<MyBookingsPage />} />
            <Route path="/bookings/admin" element={<AdminBookingReviewPage />} />
            <Route path="/bookings/availability" element={<AvailabilityViewPage />} />
            <Route path="/bookings/:id" element={<BookingDetailsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
