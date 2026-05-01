/**
 * Bridge adapter: exposes the legacy `currentUser` interface (used by booking/ticket pages)
 * by reading from the real AuthContext in contexts/AuthContext.tsx.
 */
import { useContext, useMemo } from 'react';
import { AuthContext } from '../contexts/AuthContext';

// No-op provider – the real AuthProvider is already mounted by main.tsx
export function AuthProvider({ children }) {
  return children;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  const currentUser = useMemo(() => ctx.user
    ? {
      username: ctx.user.email,
      role: ctx.user.role,
      name: ctx.user.name,
      id: ctx.user.id,
      email: ctx.user.email,
    }
    : { username: '', role: 'USER', name: '', id: '', email: '' },
    [ctx.user]);

  return { currentUser };
}
