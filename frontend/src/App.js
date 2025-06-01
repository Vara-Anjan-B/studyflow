import React from 'react';
import Home from './pages/Home';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Profile from './pages/Profile';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ActivityLog from './pages/ActivityLog';
import { ThemeProvider } from './contexts/ThemeContext';
import Tasks from './pages/Tasks';
import Feed from './pages/Feed';
import Files from './pages/Files';
import Messages from './pages/Messages';
import GroupChat from './pages/GroupChat';
import Settings from './pages/Settings';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="register" element={<Register />} />
              <Route path="login" element={<Login />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password/:token" element={<ResetPassword />} />
              <Route path="verify-email/:token" element={<VerifyEmail />} />
              <Route path="profile" element={<Profile />} />
              <Route path='/dashboard' element={<Dashboard />}/>
              <Route path="/activity" element={<ActivityLog />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/files" element={<Files />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/groupchat" element={<GroupChat />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;