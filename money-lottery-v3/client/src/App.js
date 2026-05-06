import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home        from './pages/Home';
import AdminLogin  from './pages/AdminLogin';
import AdminPanel  from './pages/AdminPanel';

function Guard({ children }) {
  return localStorage.getItem('ml_token') ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"             element={<Home />} />
        <Route path="/admin/login"  element={<AdminLogin />} />
        <Route path="/admin"        element={<Guard><AdminPanel /></Guard>} />
      </Routes>
    </BrowserRouter>
  );
}
