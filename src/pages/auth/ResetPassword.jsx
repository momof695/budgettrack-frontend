// Fichier : src/pages/auth/ResetPassword.jsx

import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../services/api'

export default function ResetPassword() {
  const [searchParams]        = useSearchParams()
  const navigate              = useNavigate()
  const [form, setForm]       = useState({
    email:                 searchParams.get('email') ?? '',
    token:                 searchParams.get('token') ?? '',
    password:              '',
    password_confirmation: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/reset-password', form)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Lien invalide ou expiré.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition"

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Nouveau mot de passe</h1>
          <p className="text-sm text-gray-400 mt-1">Choisissez un nouveau mot de passe sécurisé.</p>
        </div>

        {success ? (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 text-sm text-emerald-700">
            <p className="font-semibold mb-1">Mot de passe modifié</p>
            <p>Vous allez être redirigé vers la connexion dans 3 secondes...</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input type="email" name="email" value={form.email} onChange={handle}
                required className={inputCls} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Nouveau mot de passe
              </label>
              <input type="password" name="password" value={form.password} onChange={handle}
                placeholder="Minimum 8 caractères" required className={inputCls} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Confirmer le mot de passe
              </label>
              <input type="password" name="password_confirmation" value={form.password_confirmation}
                onChange={handle} placeholder="••••••••" required className={inputCls} />
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white text-sm font-semibold py-3 rounded-lg transition-colors">
              {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
            </button>

            <p className="text-center text-sm text-gray-400">
              <Link to="/login" className="text-gray-900 font-semibold hover:underline">
                Retour à la connexion
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}