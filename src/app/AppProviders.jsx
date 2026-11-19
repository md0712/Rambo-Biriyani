import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';

export const AppProviders = ({ children }) => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  );
};

export default AppProviders;
