// Fichier : src/pages/auth/Login.jsx

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      await login(form)
      navigate('/dashboard')
    } catch (err) {
      const data = err.response?.data
      if (data?.errors) setErrors(data.errors)
      else setErrors({ email: [data?.message || 'Identifiants incorrects.'] })
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition"

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">

      {/* Panel gauche — branding (desktop) / header (mobile) */}
      <div className="md:w-2/5 bg-gray-900 flex flex-col md:justify-between
        px-8 pt-10 pb-8 md:p-12 md:min-h-screen">

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-black">B</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">BudgetTrack</span>
        </div>

        {/* Tagline — caché sur mobile */}
        <div className="hidden md:block">
          <h2 className="text-4xl font-bold text-white leading-snug">
            Prenez le contrôle<br />de vos finances.
          </h2>
          <p className="text-gray-400 mt-4 text-sm leading-relaxed">
            Suivez vos revenus, gérez vos dépenses et atteignez vos objectifs d'épargne.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            {[
              'Tableau de bord en temps réel',
              'Mobile Money — Orange & Moov',
              "Objectifs d'épargne personnalisés",
            ].map(l => (
              <div key={l} className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                <p className="text-gray-300 text-sm">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="hidden md:block text-gray-600 text-xs">© 2025 BudgetTrack</p>
      </div>

      {/* Panel droit — formulaire */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Connexion</h1>
            <p className="text-gray-400 text-sm mt-1">Bienvenue. Entrez vos identifiants.</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Adresse email
              </label>
              <input type="email" name="email" value={form.email} onChange={handle}
                placeholder="vous@exemple.com" required autoComplete="email" className={inputCls} />
              {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email[0]}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Mot de passe
                </label>
                <Link to="/forgot-password" className="text-xs text-gray-400 hover:text-gray-700 transition">
                  Oublié ?
                </Link>
              </div>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} name="password" value={form.password} onChange={handle}
                  placeholder="••••••••" required autoComplete="current-password"
                  className={inputCls + ' pr-12'} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700 transition">
                  {showPwd ? 'Cacher' : 'Voir'}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password[0]}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white text-sm font-semibold py-3.5 rounded-xl transition-colors">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-sm text-gray-400 mt-6 text-center">
            Pas de compte ?{' '}
            <Link to="/register" className="text-gray-900 font-semibold hover:underline">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}