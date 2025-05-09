import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a Context for the user data
const UserContext = createContext();

// Custom hook to access the user data
export const useUser = () => useContext(UserContext);

// Provider component to wrap your app and provide user data
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Initialize user state from localStorage or null if not present
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Update user state whenever the localStorage changes
  const setUserData = (userData) => {
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
    setUser(userData);
  };

  // This will ensure that the context value is updated when localStorage changes
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};
