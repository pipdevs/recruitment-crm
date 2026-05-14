import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { SignUp } from './components/SignUp';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CandidateList, CandidateDetail } from './pages/Candidates';
import { CompanyList, CompanyDetail } from './pages/Companies';
import { JobList, JobDetail } from './pages/Jobs';
import { Tasks } from './pages/Tasks';
import { Notes } from './pages/Notes';
import { Contacts } from './pages/Contacts';
import { JobApplications } from './pages/JobApplications';
import { Placements } from './pages/Placements';
import { Team } from './pages/Team';
import { Billing } from './pages/Billing';
import { AcceptInvite } from './pages/AcceptInvite';
import { Landing } from './pages/Landing';
import { ResetPassword } from './pages/ResetPassword';
import { useNavigate } from 'react-router-dom';

function ProtectedApp() {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (location.pathname === '/') return <Landing />;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/candidates" element={<CandidateList />} />
        <Route path="/candidates/:id" element={<CandidateDetail />} />
        <Route path="/companies" element={<CompanyList />} />
        <Route path="/companies/:id" element={<CompanyDetail />} />
        <Route path="/jobs" element={<JobList />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/applications" element={<JobApplications />} />
        <Route path="/placements" element={<Placements />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/team" element={<Team />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <Login onToggleMode={() => navigate('/signup')} />;
}

function SignUpPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <SignUp onToggleMode={() => navigate('/login')} />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/invite/:token" element={<AcceptInvite />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="*" element={<ProtectedApp />} />
    </Routes>
  );
}