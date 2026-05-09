// Fichier : src/pages/profile/Profile.jsx

import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/api'

const inputCls = "w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition"
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"

// ── Bloc section ───────────────────────────────────────────
function Section({ title, sub, children }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <div className="mb-5 pb-4 border-b border-gray-50">
        <h2 className="text-sm font-bold text-gray-900">{title}</h2>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  )
}

// ── Toast notification ─────────────────────────────────────
function Toast({ msg, type }) {
  if (!msg) return null
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg transition
      ${type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-50 text-red-600 border border-red-100'}`}>
      {msg}
    </div>
  )
}

export default function Profile() {
  const { user, updateUser, logout } = useAuth()

  // Formulaire profil
  const [profile, setProfile] = useState({
    name:  user?.name  ?? '',
    phone: user?.phone ?? '',
  })

  // Formulaire mot de passe
  const [pwd, setPwd] = useState({
    current_password: '', password: '', password_confirmation: ''
  })

  const [profileErrors, setProfileErrors] = useState({})
  const [pwdErrors, setPwdErrors]         = useState({})
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPwd, setSavingPwd]         = useState(false)
  const [showPwd, setShowPwd]             = useState(false)
  const [toast, setToast]                 = useState({ msg: '', type: '' })

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg: '', type: '' }), 3000)
  }

  // Initiales avatar
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'BT'

  // ── Soumettre profil ──────────────────────────────────────
  const submitProfile = async e => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileErrors({})
    try {
      const { data } = await authService.updateProfile(profile)
      updateUser(data.user)
      showToast('Profil mis à jour avec succès.')
    } catch (err) {
      if (err.response?.data?.errors) setProfileErrors(err.response.data.errors)
      else showToast('Une erreur est survenue.', 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  // ── Soumettre mot de passe ────────────────────────────────
  const submitPwd = async e => {
    e.preventDefault()
    setSavingPwd(true)
    setPwdErrors({})
    try {
      await authService.updatePassword(pwd)
      setPwd({ current_password: '', password: '', password_confirmation: '' })
      showToast('Mot de passe modifié avec succès.')
    } catch (err) {
      if (err.response?.data?.errors) setPwdErrors(err.response.data.errors)
      else setPwdErrors({ current_password: [err.response?.data?.message ?? 'Erreur.'] })
    } finally {
      setSavingPwd(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">

      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profil</h1>
        <p className="text-sm text-gray-400 mt-1">Gérez vos informations personnelles</p>
      </div>

      {/* Avatar + infos rapides */}
      <div className="bg-gray-900 rounded-2xl p-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xl font-bold">{initials}</span>
        </div>
        <div>
          <p className="text-white font-bold text-base">{user?.name}</p>
          <p className="text-gray-400 text-sm mt-0.5">{user?.email}</p>
          {user?.phone && <p className="text-gray-500 text-xs mt-0.5">{user.phone}</p>}
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Devise</p>
          <p className="text-white font-bold text-sm mt-1">{user?.currency ?? 'FCFA'}</p>
        </div>
      </div>

      {/* Informations personnelles */}
      <Section title="Informations personnelles" sub="Modifiez vos coordonnées">
        <form onSubmit={submitProfile} className="space-y-4">

          <div>
            <label className={labelCls}>Nom complet</label>
            <input type="text" value={profile.name}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
              placeholder="Votre nom" required className={inputCls} />
            {profileErrors.name && <p className="text-red-500 text-xs mt-1">{profileErrors.name[0]}</p>}
          </div>

          <div>
            <label className={labelCls}>Adresse email</label>
            <input type="email" value={user?.email} disabled
              className={inputCls + ' opacity-50 cursor-not-allowed'} />
            <p className="text-xs text-gray-400 mt-1">L'email ne peut pas être modifié.</p>
          </div>

          <div>
            <label className={labelCls}>
              Téléphone <span className="normal-case font-normal text-gray-400">(optionnel)</span>
            </label>
            <input type="text" value={profile.phone}
              onChange={e => setProfile({ ...profile, phone: e.target.value })}
              placeholder="+226 70 00 00 00" className={inputCls} />
          </div>

          <div className="pt-1">
            <button type="submit" disabled={savingProfile}
              className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
              {savingProfile ? 'Enregistrement...' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </Section>

      {/* Sécurité */}
      <Section title="Sécurité" sub="Changez votre mot de passe">
        <form onSubmit={submitPwd} className="space-y-4">

          <div>
            <label className={labelCls}>Mot de passe actuel</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} value={pwd.current_password}
                onChange={e => setPwd({ ...pwd, current_password: e.target.value })}
                placeholder="••••••••" required className={inputCls + ' pr-12'} />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700 transition">
                {showPwd ? 'Cacher' : 'Voir'}
              </button>
            </div>
            {pwdErrors.current_password && <p className="text-red-500 text-xs mt-1">{pwdErrors.current_password[0]}</p>}
          </div>

          <div>
            <label className={labelCls}>Nouveau mot de passe</label>
            <input type="password" value={pwd.password}
              onChange={e => setPwd({ ...pwd, password: e.target.value })}
              placeholder="Minimum 8 caractères" required className={inputCls} />
            {pwdErrors.password && <p className="text-red-500 text-xs mt-1">{pwdErrors.password[0]}</p>}
          </div>

          <div>
            <label className={labelCls}>Confirmer le nouveau mot de passe</label>
            <input type="password" value={pwd.password_confirmation}
              onChange={e => setPwd({ ...pwd, password_confirmation: e.target.value })}
              placeholder="••••••••" required className={inputCls} />
          </div>

          <div className="pt-1">
            <button type="submit" disabled={savingPwd}
              className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
              {savingPwd ? 'Modification...' : 'Changer le mot de passe'}
            </button>
          </div>
        </form>
      </Section>

      {/* Zone danger */}
      <Section title="Zone de danger" sub="Actions irréversibles">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800">Se déconnecter</p>
            <p className="text-xs text-gray-400 mt-0.5">Vous serez redirigé vers la page de connexion</p>
          </div>
          <button onClick={logout}
            className="text-sm font-semibold text-red-500 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition">
            Déconnexion
          </button>
        </div>
      </Section>

      <Toast msg={toast.msg} type={toast.type} />
    </div>
  )
}