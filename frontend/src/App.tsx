/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OverviewPage from './pages/OverviewPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NoticesPage from './pages/NoticesPage';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
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
            
            {/* Specific Module Access Examples */}
            <Route 
              path="bookings" 
              element={
                <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                  <div className="p-8 border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center min-h-[400px]">
                    <h2 className="text-xl font-bold text-zinc-100 font-serif italic mb-2">Module A & B: Facility Bookings</h2>
                    <p className="text-zinc-500 max-w-sm text-center">Implementation of catalog search, filtering and time-range booking workflow.</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="tickets" 
              element={
                <ProtectedRoute allowedRoles={['TECHNICIAN', 'ADMIN', 'USER']}>
                  <div className="p-8 border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center min-h-[400px]">
                    <h2 className="text-xl font-bold text-zinc-100 font-serif italic mb-2">Module C: Maintenance Tickets</h2>
                    <p className="text-zinc-500 max-w-sm text-center">Implementation of incident reporting, image attachments and technician assignments.</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            
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
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

