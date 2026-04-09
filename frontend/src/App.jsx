import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import JdMatcher from './pages/JdMatcher';
import KanbanBoard from './pages/KanbanBoard';
import ViewProfile from './pages/ViewProfile';
import './App.css';

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;
