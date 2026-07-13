import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import JdMatcher from './pages/JdMatcher';
import KanbanBoard from './pages/KanbanBoard';
import ViewProfile from './pages/ViewProfile';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

// Protected route - only accessible when logged in as admin
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
}

// Main app layout (with sidebar)
function AppLayout() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<ViewProfile />} />
          <Route path="/matcher" element={<JdMatcher />} />
          <Route path="/board" element={<KanbanBoard />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Admin auth routes - no sidebar */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected admin dashboard - no sidebar, full screen */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <main style={{ padding: '1.5rem', minHeight: '100vh' }}>
                  <AdminDashboard />
                </main>
              </ProtectedRoute>
            }
          />

          {/* Regular app layout with sidebar */}
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
