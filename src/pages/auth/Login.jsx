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

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Panel gauche — branding */}
      <div className="hidden md:flex md:w-2/5 bg-gray-900 flex-col justify-between p-10">
        <div>
          <span className="text-white text-xl font-bold tracking-tight">BudgetTrack</span>
        </div>
        <div>
          <h2 className="text-4xl font-bold text-white leading-snug">
            Prenez le contrôle<br />de vos finances.
          </h2>
          <p className="text-gray-400 mt-4 text-base leading-relaxed">
            Suivez vos revenus, gérez vos dépenses et atteignez vos objectifs d'épargne — simplement.
          </p>
          <div className="mt-10 flex flex-col gap-4">
            {[
              { label: 'Tableau de bord en temps réel', sub: 'Visualisez votre solde instantanément' },
              { label: 'Mobile Money intégré',          sub: 'Orange Money, Moov Money et plus' },
              { label: "Objectifs d'épargne",           sub: 'Suivez votre progression pas à pas' },
            ].map(({ label, sub }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm font-medium">{label}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-gray-600 text-xs">© 2025 BudgetTrack. Conçu pour l'Afrique.</p>
      </div>

      {/* Panel droit — formulaire */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Connexion</h1>
            <p className="text-gray-500 text-sm mt-1">Bienvenue. Entrez vos identifiants.</p>
          </div>

          <form onSubmit={submit} className="space-y-5">

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Adresse email
              </label>
              <input
                type="email" name="email" value={form.email} onChange={handle}
                placeholder="vous@exemple.com" required autoComplete="email"
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email[0]}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Mot de passe
                </label>
                <Link to="/forgot-password" className="text-xs text-gray-400 hover:text-gray-700 transition">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'} name="password" value={form.password} onChange={handle}
                  placeholder="••••••••" required autoComplete="current-password"
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition pr-12"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs transition">
                  {showPwd ? 'Cacher' : 'Voir'}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password[0]}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white text-sm font-semibold py-3 rounded-lg transition-colors">
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-6 text-center">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-gray-900 font-semibold hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}