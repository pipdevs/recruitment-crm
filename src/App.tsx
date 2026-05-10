import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { SignUp } from './components/SignUp';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Candidates } from './pages/Candidates';
import { Companies } from './pages/Companies';
import { Jobs } from './pages/Jobs';
import { Tasks } from './pages/Tasks';
import { Notes } from './pages/Notes';
import { Contacts } from './pages/Contacts';
import { JobApplications } from './pages/JobApplications';
import { Placements } from './pages/Placements';
import { useState } from 'react';
import { Team } from './pages/Team';
import { AcceptInvite } from './pages/AcceptInvite';

export default function App() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return authMode === 'login' ? (
      <Login onToggleMode={() => setAuthMode('signup')} />
    ) : (
      <SignUp onToggleMode={() => setAuthMode('login')} />
    );
  }

  return (
    <>
      <Routes>
        <Route path="/invite/:token" element={<AcceptInvite />} />
        <Route path="*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/candidates" element={<Candidates />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/applications" element={<JobApplications />} />
              <Route path="/placements" element={<Placements />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/team" element={<Team />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </>
  );
}