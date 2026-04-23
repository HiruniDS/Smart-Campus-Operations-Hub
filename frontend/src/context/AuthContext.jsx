import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const DEMO_USERS = {
  student1: { username: 'student1', password: 'password123', role: 'USER' },
  admin1: { username: 'admin1', password: 'password123', role: 'ADMIN' },
  tech1: { username: 'tech1', password: 'password123', role: 'TECHNICIAN' },
  tech2: { username: 'tech2', password: 'password123', role: 'TECHNICIAN' },
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(DEMO_USERS.student1);

  const loginAs = (username) => {
    if (DEMO_USERS[username]) {
      setCurrentUser(DEMO_USERS[username]);
    }
  };

  const value = useMemo(
    () => ({ currentUser, loginAs, users: Object.values(DEMO_USERS) }),
    [currentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
