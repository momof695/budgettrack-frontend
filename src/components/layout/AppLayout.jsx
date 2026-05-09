// Fichier : src/components/layout/AppLayout.jsx

import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard',    label: 'Dashboard' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/categories',   label: 'Catégories' },
  { to: '/goals',        label: 'Objectifs' },
  { to: '/profile',      label: 'Profil' },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'BT'

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Sidebar desktop ─────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-100 fixed h-full z-10">

        {/* Logo */}
        <div className="px-6 h-16 flex items-center border-b border-gray-100">
          <span className="text-gray-900 font-bold text-lg tracking-tight">BudgetTrack</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-0.5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">Menu</p>
          {navItems.map(({ to, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-lg text-sm transition-colors font-medium
                 ${isActive
                   ? 'bg-gray-900 text-white'
                   : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`
              }>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="mt-3 w-full text-xs text-gray-400 hover:text-red-500 text-left transition-colors py-1">
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Contenu principal ────────────────────────────── */}
      <main className="flex-1 md:ml-60 flex flex-col min-h-screen">

        {/* Header mobile */}
        <header className="md:hidden flex items-center justify-between px-5 h-14 bg-white border-b border-gray-100 sticky top-0 z-10">
          <span className="text-gray-900 font-bold text-base tracking-tight">BudgetTrack</span>
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-500 hover:text-gray-900 transition text-xl font-light">
            {menuOpen ? '✕' : '≡'}
          </button>
        </header>

        {/* Menu mobile */}
        {menuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 px-3 py-3 space-y-0.5">
            {navItems.map(({ to, label }) => (
              <NavLink key={to} to={to} onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                   ${isActive ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`
                }>
                {label}
              </NavLink>
            ))}
            <button onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-red-500 transition-colors">
              Déconnexion
            </button>
          </div>
        )}

        {/* Page */}
        <div className="flex-1 p-6 md:p-10 max-w-6xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}