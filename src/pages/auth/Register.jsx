// Fichier : src/pages/auth/Register.jsx

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const inputClass = "w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition"
const labelClass = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5"

export default function Register() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [form, setForm]       = useState({ name: '', email: '', phone: '', password: '', password_confirmation: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      const data = err.response?.data
      if (data?.errors) setErrors(data.errors)
      else setErrors({ name: [data?.message || 'Une erreur est survenue.'] })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Panel gauche — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 flex-col justify-between p-12">
        <span className="text-white text-xl font-bold tracking-tight">BudgetTrack</span>
        <div>
          <h2 className="text-4xl font-bold text-white leading-snug">
            Commencez à gérer<br />votre argent aujourd'hui.
          </h2>
          <p className="text-gray-400 mt-4 text-base leading-relaxed">
            Créez votre compte gratuitement et commencez à suivre vos finances en moins de 2 minutes.
          </p>
        </div>
        <p className="text-gray-600 text-xs">© 2025 BudgetTrack. Conçu pour l'Afrique.</p>
      </div>

      {/* Panel droit — formulaire */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
            <p className="text-gray-500 text-sm mt-1">Remplissez les informations ci-dessous.</p>
          </div>

          <form onSubmit={submit} className="space-y-5">

            <div>
              <label className={labelClass}>Nom complet</label>
              <input type="text" name="name" value={form.name} onChange={handle}
                placeholder="Moussa Traoré" required className={inputClass} />
              {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name[0]}</p>}
            </div>

            <div>
              <label className={labelClass}>Adresse email</label>
              <input type="email" name="email" value={form.email} onChange={handle}
                placeholder="vous@exemple.com" required className={inputClass} />
              {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email[0]}</p>}
            </div>

            <div>
              <label className={labelClass}>
                Téléphone <span className="normal-case text-gray-400 font-normal">(optionnel)</span>
              </label>
              <input type="text" name="phone" value={form.phone} onChange={handle}
                placeholder="+226 70 00 00 00" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Mot de passe</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} name="password" value={form.password} onChange={handle}
                  placeholder="Minimum 8 caractères" required className={inputClass + ' pr-12'} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs transition">
                  {showPwd ? 'Cacher' : 'Voir'}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password[0]}</p>}
            </div>

            <div>
              <label className={labelClass}>Confirmer le mot de passe</label>
              <input type="password" name="password_confirmation" value={form.password_confirmation} onChange={handle}
                placeholder="••••••••" required className={inputClass} />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white text-sm font-semibold py-3 rounded-lg transition-colors">
              {loading ? 'Création en cours...' : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-6 text-center">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-gray-900 font-semibold hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}