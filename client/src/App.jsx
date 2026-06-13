import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import FloatingAddButton from './components/FloatingAddButton';
import ParticleField from './components/ParticleField';
import PageWrapper from './components/PageWrapper';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import DSA from './pages/DSA';
import Aptitude from './pages/Aptitude';
import Attendance from './pages/Attendance';
import Settings from './pages/Settings';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyber-cyan"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Guest/Unauthenticated Route Wrapper
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyber-cyan"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Main Layout wrapping sidebar and navbar
const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex bg-black text-gray-100 font-body relative">
      {/* Fixed/Responsive Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Primary Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 p-6 md:p-8 overflow-y-auto z-10">
          <Routes>
            <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
            <Route path="/calendar" element={<PageWrapper><Calendar /></PageWrapper>} />
            <Route path="/dsa" element={<PageWrapper><DSA /></PageWrapper>} />
            <Route path="/aptitude" element={<PageWrapper><Aptitude /></PageWrapper>} />
            <Route path="/attendance" element={<PageWrapper><Attendance /></PageWrapper>} />
            <Route path="/settings" element={<PageWrapper><Settings /></PageWrapper>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>

      {/* Floating Add Task button on all screens */}
      <FloatingAddButton />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Guest routes */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <PageWrapper>
                  <Login />
                </PageWrapper>
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={<Navigate to="/login" replace />}
          />

          {/* Core protected application shell */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
