// Fichier : src/pages/auth/ForgotPassword.jsx

import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

export default function ForgotPassword() {
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Mot de passe oublié</h1>
          <p className="text-sm text-gray-400 mt-1">
            Entrez votre email pour recevoir un lien de réinitialisation.
          </p>
        </div>

        {sent ? (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 text-sm text-emerald-700">
            <p className="font-semibold mb-1">Email envoyé</p>
            <p>Vérifiez votre boîte mail et suivez le lien pour réinitialiser votre mot de passe.</p>
            <Link to="/login" className="mt-4 inline-block text-xs font-semibold text-gray-900 underline">
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Adresse email
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="vous@exemple.com" required
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition"
              />
              {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white text-sm font-semibold py-3 rounded-lg transition-colors">
              {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
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