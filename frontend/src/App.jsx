import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

const Login = lazy(() => import('./pages/Login'));
const AuthSuccess = lazy(() => import('./pages/AuthSuccess'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Campaigns = lazy(() => import('./pages/Campaigns'));
const CreateCampaign = lazy(() => import('./pages/CreateCampaign'));
const CampaignDetails = lazy(() => import('./pages/CampaignDetails'));
const Recipients = lazy(() => import('./pages/Recipients'));
const Lists = lazy(() => import('./pages/Lists'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Logs = lazy(() => import('./pages/Logs'));
const Profile = lazy(() => import('./pages/Profile'));

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth-success" element={<AuthSuccess />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/campaigns/new" element={<CreateCampaign />} />
            <Route path="/campaigns/:id" element={<CampaignDetails />} />
            <Route path="/recipients" element={<Recipients />} />
            <Route path="/lists" element={<Lists />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
