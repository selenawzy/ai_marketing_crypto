import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Web3Provider } from './contexts/Web3Context';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import CreateAgent from './pages/CreateAgent';
import Browse from './pages/Browse';
import Agents from './pages/Agents';
import ContentDetail from './pages/ContentDetail';
import AgentDetail from './pages/AgentDetail';
import PayPerCallDemo from './pages/PayPerCallDemo';
import BuyCrypto from './pages/BuyCrypto';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Web3Provider>
        <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/buy-crypto" element={<BuyCrypto />} />
            <Route path="/agents/:id" element={<AgentDetail />} />
            <Route path="/content/:id" element={<ContentDetail />} />
            <Route path="/demo/pay-per-call" element={<PayPerCallDemo />} />
            
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agents/create"
              element={
                <ProtectedRoute>
                  <CreateAgent />
                </ProtectedRoute>
              }
            />
            
            {/* Home page as main landing */}
            <Route path="/" element={<Home />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/browse" replace />} />
          </Routes>
        </Router>
      </Web3Provider>
    </AuthProvider>
  );
}

export default App; 