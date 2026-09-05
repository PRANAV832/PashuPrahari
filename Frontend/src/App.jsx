import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FarmerLanguageProvider } from './context/FarmerLanguageContext';
import { Header } from './components/layout/Header';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicOnlyRoute } from './components/auth/PublicOnlyRoute';
import { USER_ROLES, ROLE_HOME_ROUTES } from './services/authService';

// Pages
import { Login } from './pages/Login';
import { OtpVerify } from './pages/OtpVerify';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminCases } from './pages/admin/AdminCases';
import { AdminCaseAssignment } from './pages/admin/AdminCaseAssignment';
import { AdminCaseDetail } from './pages/admin/AdminCaseDetail';
import { AdminUserList } from './pages/admin/AdminUserList';
import { RegisterFarmer } from './pages/admin/RegisterFarmer';
import { RegisterVeterinarian } from './pages/admin/RegisterVeterinarian';
import { FarmerDashboard } from './pages/FarmerDashboard';
import { FarmerReport } from './pages/FarmerReport';
import { FarmerCases } from './pages/FarmerCases';
import { FarmerCaseDetail } from './pages/FarmerCaseDetail';
import { VeterinarianDashboard } from './pages/VeterinarianDashboard';
import { VetAssignedCases } from './pages/VetAssignedCases';
import { VetCaseDetail } from './pages/VetCaseDetail';

// Helper for root path redirection based on active role
const RootRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    const target = ROLE_HOME_ROUTES[user.role] || '/farmer/report';
    return <Navigate to={target} replace />;
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <FarmerLanguageProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
            <Header />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Routes>
              {/* ── Public / Guest-only Routes ── */}
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <Login />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/verify"
                element={
                  <PublicOnlyRoute>
                    <OtpVerify />
                  </PublicOnlyRoute>
                }
              />

              {/* ── Admin Management & Oversight Routes ── */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/cases"
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                    <AdminCases />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/assignment"
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                    <AdminCaseAssignment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/cases/:id"
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                    <AdminCaseDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                    <AdminUserList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users/register-farmer"
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                    <RegisterFarmer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users/register-veterinarian"
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                    <RegisterVeterinarian />
                  </ProtectedRoute>
                }
              />

              {/* ── Farmer Routes ── */}
              <Route
                path="/farmer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.FARMER, USER_ROLES.ADMIN]}>
                    <FarmerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/farmer/report"
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.FARMER, USER_ROLES.ADMIN]}>
                    <FarmerReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/farmer/cases"
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.FARMER, USER_ROLES.ADMIN]}>
                    <FarmerCases />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/farmer/cases/:id"
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.FARMER, USER_ROLES.ADMIN]}>
                    <FarmerCaseDetail />
                  </ProtectedRoute>
                }
              />

              {/* ── Veterinarian Clinical Routes (Strictly Veterinarian Only) ── */}
              <Route
                path="/veterinarian/dashboard"
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.VETERINARIAN]}>
                    <VeterinarianDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/veterinarian/cases"
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.VETERINARIAN]}>
                    <VetAssignedCases />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/veterinarian/assigned-cases"
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.VETERINARIAN]}>
                    <VetAssignedCases />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/veterinarian/cases/:id"
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.VETERINARIAN]}>
                    <VetCaseDetail />
                  </ProtectedRoute>
                }
              />

              {/* ── Root & Fallback Redirection ── */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </FarmerLanguageProvider>
  </AuthProvider>
);
}

export default App;
