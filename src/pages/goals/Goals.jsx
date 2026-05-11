// Fichier : src/pages/goals/Goals.jsx

import { useEffect, useState } from 'react'
import { goalService } from '../../services/api'

const fmt  = n => new Intl.NumberFormat('fr-FR').format(Math.round(n))
const fmtF = n => fmt(n) + ' FCFA'

const EMPTY_FORM = { title: '', description: '', target_amount: '', deadline: '' }

function Icon({ path, className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  )
}

function GoalModal({ open, onClose, onSaved, editing }) {
  const [form, setForm]     = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(editing ? {
      title:         editing.title ?? '',
      description:   editing.description ?? '',
      target_amount: editing.target_amount ?? '',
      deadline:      editing.deadline?.split('T')[0] ?? '',
    } : EMPTY_FORM)
    setErrors({})
  }, [editing, open])

  if (!open) return null

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async e => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      if (editing) await goalService.update(editing.id, form)
      else         await goalService.create(form)
      onSaved()
      onClose()
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors)
    } finally {
      setSaving(false)
    }
  }

  const inputCls = "w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition placeholder-gray-300"
  const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md p-6 z-10">
        <div className="sm:hidden w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-gray-900">
            {editing ? 'Modifier l\'objectif' : 'Nouvel objectif'}
          </h2>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 transition">
            <Icon path="M6 18L18 6M6 6l12 12" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className={labelCls}>Titre</label>
            <input type="text" name="title" value={form.title} onChange={handle}
              placeholder="Ex: Achat moto, Frais scolaires..." required className={inputCls} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title[0]}</p>}
          </div>
          <div>
            <label className={labelCls}>Montant cible (FCFA)</label>
            <input type="number" name="target_amount" value={form.target_amount} onChange={handle}
              placeholder="500 000" min="1" required className={inputCls} />
            {errors.target_amount && <p className="text-red-500 text-xs mt-1">{errors.target_amount[0]}</p>}
          </div>
          <div>
            <label className={labelCls}>Date limite <span className="normal-case font-normal text-gray-300">(optionnel)</span></label>
            <input type="date" name="deadline" value={form.deadline} onChange={handle} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Description <span className="normal-case font-normal text-gray-300">(optionnel)</span></label>
            <textarea name="description" value={form.description} onChange={handle}
              placeholder="Décrivez votre objectif..." rows={2}
              className={inputCls + ' resize-none'} />
          </div>
          <button type="submit" disabled={saving}
            className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 text-white text-sm font-semibold py-3.5 rounded-xl transition-colors">
            {saving ? 'Enregistrement...' : editing ? 'Modifier' : 'Créer l\'objectif'}
          </button>
        </form>
      </div>
    </div>
  )
}

function DepositModal({ open, onClose, onSaved, goal }) {
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { setAmount('') }, [open])
  if (!open || !goal) return null

  const submit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      await goalService.deposit(goal.id, { amount })
      onSaved()
      onClose()
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const remaining = goal.target_amount - goal.current_amount

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm p-6 z-10">
        <div className="sm:hidden w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900">Ajouter une épargne</h2>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 transition">
            <Icon path="M6 18L18 6M6 6l12 12" />
          </button>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-5">
          <p className="text-xs text-gray-400 mb-0.5">Objectif</p>
          <p className="text-sm font-bold text-gray-900">{goal.title}</p>
          <p className="text-xs text-gray-400 mt-1">Restant : <span className="font-semibold text-gray-700">{fmtF(remaining)}</span></p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Montant (FCFA)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="Ex: 10 000" min="1" required
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition placeholder-gray-300" />
          </div>
          <button type="submit" disabled={saving}
            className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 text-white text-sm font-semibold py-3.5 rounded-xl transition-colors">
            {saving ? 'Enregistrement...' : 'Confirmer le dépôt'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function Goals() {
  const [goals, setGoals]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [modalOpen, setModalOpen]   = useState(false)
  const [depositOpen, setDepositOpen] = useState(false)
  const [editing, setEditing]       = useState(null)
  const [selected, setSelected]     = useState(null)

  const load = () => {
    setLoading(true)
    goalService.list()
      .then(r => setGoals(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openAdd     = () => { setEditing(null); setModalOpen(true) }
  const openEdit    = g  => { setEditing(g);   setModalOpen(true) }
  const openDeposit = g  => { setSelected(g);  setDepositOpen(true) }
  const remove      = async id => {
    if (!confirm('Supprimer cet objectif ?')) return
    await goalService.remove(id)
    load()
  }

  const active    = goals.filter(g => g.status === 'active')
  const completed = goals.filter(g => g.status === 'completed')

  const GoalCard = ({ g }) => {
    const pct      = g.progress_percent ?? 0
    const done     = g.is_completed
    const daysLeft = g.deadline ? Math.ceil((new Date(g.deadline) - new Date()) / 86400000) : null

    return (
      <div className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group
        ${done ? 'border-emerald-100' : 'border-gray-100'}`}>

        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 mr-3">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-gray-900">{g.title}</p>
              {done && (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Atteint
                </span>
              )}
            </div>
            {g.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{g.description}</p>}
          </div>
          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            {!done && (
              <button onClick={() => openDeposit(g)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition">
                <Icon path="M12 4v16m8-8H4" className="w-3.5 h-3.5" />
              </button>
            )}
            <button onClick={() => openEdit(g)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition">
              <Icon path="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => remove(g.id)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition">
              <Icon path="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-gray-700">{fmtF(g.current_amount)}</span>
            <span className={`text-xs font-bold ${pct >= 100 ? 'text-emerald-500' : pct >= 50 ? 'text-blue-500' : 'text-gray-500'}`}>
              {pct}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div className="h-2 rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: done ? '#10b981' : pct >= 50 ? '#3b82f6' : '#111827'
              }} />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-xs text-gray-400">Cible : {fmtF(g.target_amount)}</p>
            {daysLeft !== null && !done && (
              <span className={`text-xs font-semibold ${daysLeft < 7 ? 'text-red-500' : 'text-gray-400'}`}>
                {daysLeft > 0 ? `${daysLeft}j restants` : 'Délai dépassé'}
              </span>
            )}
          </div>
        </div>

        {/* Restant */}
        {!done && (
          <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-400">Restant</span>
            <span className="text-xs font-bold text-gray-700">{fmtF(g.remaining_amount ?? 0)}</span>
          </div>
        )}

        {/* Bouton épargner visible */}
        {!done && (
          <button onClick={() => openDeposit(g)}
            className="mt-3 w-full text-xs font-semibold text-gray-600 border border-gray-100 py-2 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all">
            Ajouter une épargne
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Objectifs</h1>
          <p className="text-sm text-gray-400 mt-0.5">Suivez vos projets d'épargne</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
          <Icon path="M12 4v16m8-8H4" className="w-3.5 h-3.5" />
          Nouvel objectif
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Icon path="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" className="w-5 h-5 text-gray-300" />
          </div>
          <p className="text-gray-300 text-sm mb-3">Aucun objectif défini</p>
          <button onClick={openAdd}
            className="text-xs font-semibold text-gray-900 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
            Créer un objectif
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                En cours · {active.length}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {active.map(g => <GoalCard key={g.id} g={g} />)}
              </div>
            </div>
          )}
          {completed.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Atteints · {completed.length}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {completed.map(g => <GoalCard key={g.id} g={g} />)}
              </div>
            </div>
          )}
        </div>
      )}

      <GoalModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={load} editing={editing} />
      <DepositModal open={depositOpen} onClose={() => setDepositOpen(false)} onSaved={load} goal={selected} />
    </div>
  )
}