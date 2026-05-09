// Fichier : src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Pages Auth
import Login          from './pages/auth/Login'
import Register       from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword  from './pages/auth/ResetPassword'

// Pages App
import Dashboard    from './pages/dashboard/Dashboard'
import Transactions from './pages/transactions/Transactions'
import Categories   from './pages/categories/Categories'
import Goals        from './pages/goals/Goals'
import Profile      from './pages/profile/Profile'

// Layout
import AppLayout from './components/layout/AppLayout'

// Route protégée — redirige si non connecté
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex h-screen items-center justify-center text-gray-500">Chargement...</div>
  return user ? children : <Navigate to="/login" replace />
}

// Route publique — redirige si déjà connecté
function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Routes publiques */}
          <Route path="/login"           element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register"        element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password"  element={<PublicRoute><ResetPassword /></PublicRoute>} />

          {/* Routes protégées avec layout */}
          <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"    element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="categories"   element={<Categories />} />
            <Route path="goals"        element={<Goals />} />
            <Route path="profile"      element={<Profile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}