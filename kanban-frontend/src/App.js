import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import KanbanBoard from './components/KanbanBoard';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Login from './components/Login';

const App = () => {
  const isLoggedIn = !!localStorage.getItem('access');

  return (
    <Router>
      <div className="app-container d-flex">
        {isLoggedIn && <Sidebar />}
        <div className="main-content flex-grow-1">
          <Routes>
            <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/" />} />
            <Route path="/kanban" element={isLoggedIn ? <KanbanBoard /> : <Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
