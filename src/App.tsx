import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import PageView from './pages/PageView';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Unauthorized = () => (
  <div className="container mt-5">
    <div className="alert alert-warning">
      <h4>Access Denied</h4>
      <p>You don't have permission to access this page.</p>
    </div>
  </div>
);

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute requireSuperAdmin={true}>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout><Profile /></Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/pages/:pageId" element={
          <ProtectedRoute>
            <Layout><PageView /></Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/unauthorized" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
