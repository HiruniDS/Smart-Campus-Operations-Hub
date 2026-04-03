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
import BookingHubPage from './pages/BookingHubPage';
import TicketsHubPage from './pages/TicketsHubPage';

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

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<OverviewPage />} />
            <Route path="bookings" element={<BookingHubPage />} />
            <Route path="tickets" element={<TicketsHubPage />} />
            <Route path="facilities" element={<FacilitiesPage />} />

            <Route 
              path="notices" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <NoticesPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="users" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <div className="p-8 border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center min-h-[400px]">
                    <h2 className="text-xl font-bold text-zinc-100 font-serif italic mb-2">Module E: User Management</h2>
                    <p className="text-zinc-500 max-w-sm text-center">RBAC administration, role assignment and audit trails.</p>
                  </div>
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

