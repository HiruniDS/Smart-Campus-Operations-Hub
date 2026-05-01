/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OverviewPage from './pages/OverviewPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NoticesPage from './pages/NoticesPage';
import FacilitiesPage from './pages/FacilitiesPage';

// Booking pages
import BookingDashboardPage from './pages/booking/BookingDashboardPage';
import CreateBookingPage from './pages/booking/CreateBookingPage';
import MyBookingsPage from './pages/booking/MyBookingsPage';
import BookingDetailsPage from './pages/booking/BookingDetailsPage';
import AdminBookingReviewPage from './pages/booking/AdminBookingReviewPage';
import AvailabilityViewPage from './pages/booking/AvailabilityViewPage';

import UserManagementPage from './pages/UserManagementPage';

// Ticket pages
import TicketsHubPage from './pages/TicketsHubPage';
import CreateTicketPage from './pages/CreateTicketPage';
import TicketDetailsPage from './pages/TicketDetailsPage';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />

          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* ── Shared layout: DashboardLayout wraps all protected app pages ── */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard routes */}
            <Route path="dashboard" element={<OverviewPage />} />
            <Route path="dashboard/facilities" element={<FacilitiesPage />} />
            <Route
              path="dashboard/notices"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <NoticesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UserManagementPage />
                </ProtectedRoute>
              }
            />

            {/* Booking routes */}
            <Route path="bookings" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><BookingDashboardPage /></ProtectedRoute>} />
            <Route path="bookings/new" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><CreateBookingPage /></ProtectedRoute>} />
            <Route path="bookings/me" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><MyBookingsPage /></ProtectedRoute>} />
            <Route path="bookings/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminBookingReviewPage /></ProtectedRoute>} />
            <Route path="bookings/availability" element={<ProtectedRoute><AvailabilityViewPage /></ProtectedRoute>} />
            <Route path="bookings/:id" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}><BookingDetailsPage /></ProtectedRoute>} />

            {/* Ticket routes */}
            <Route path="tickets" element={<ProtectedRoute allowedRoles={['TECHNICIAN', 'ADMIN', 'USER']}><TicketsHubPage /></ProtectedRoute>} />
            <Route path="tickets/new" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN', 'TECHNICIAN']}><CreateTicketPage /></ProtectedRoute>} />
            <Route path="tickets/:id" element={<ProtectedRoute allowedRoles={['TECHNICIAN', 'ADMIN', 'USER']}><TicketDetailsPage /></ProtectedRoute>} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

