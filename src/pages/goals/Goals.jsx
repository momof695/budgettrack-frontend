// Fichier : src/pages/goals/Goals.jsx

import { useEffect, useState } from 'react'
import { goalService } from '../../services/api'

const fmt = n => new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' FCFA'

const EMPTY_FORM = { title: '', description: '', target_amount: '', deadline: '', icon: '' }

// ── Modal création / modification ──────────────────────────
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
      icon:          editing.icon ?? '',
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

  const inputCls = "w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition"
  const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-gray-900">
            {editing ? 'Modifier l\'objectif' : 'Nouvel objectif'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">✕</button>
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
              placeholder="Ex: 500000" min="1" required className={inputCls} />
            {errors.target_amount && <p className="text-red-500 text-xs mt-1">{errors.target_amount[0]}</p>}
          </div>

          <div>
            <label className={labelCls}>
              Date limite <span className="normal-case font-normal text-gray-400">(optionnel)</span>
            </label>
            <input type="date" name="deadline" value={form.deadline} onChange={handle} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>
              Description <span className="normal-case font-normal text-gray-400">(optionnel)</span>
            </label>
            <textarea name="description" value={form.description} onChange={handle}
              placeholder="Décrivez votre objectif..." rows={2}
              className={inputCls + ' resize-none'} />
          </div>

          <button type="submit" disabled={saving}
            className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white text-sm font-semibold py-3 rounded-lg transition-colors">
            {saving ? 'Enregistrement...' : editing ? 'Modifier' : 'Créer l\'objectif'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Modal dépôt ────────────────────────────────────────────
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
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const remaining = goal.target_amount - goal.current_amount

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 z-10">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">Ajouter une épargne</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">✕</button>
        </div>

        <p className="text-sm text-gray-500 mb-1">Objectif : <span className="font-semibold text-gray-800">{goal.title}</span></p>
        <p className="text-xs text-gray-400 mb-5">Restant : {fmt(remaining)}</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Montant (FCFA)
            </label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="Ex: 10000" min="1" required
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition" />
          </div>
          <button type="submit" disabled={saving}
            className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white text-sm font-semibold py-3 rounded-lg transition-colors">
            {saving ? 'Enregistrement...' : 'Confirmer le dépôt'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Page Objectifs ─────────────────────────────────────────
export default function Goals() {
  const [goals, setGoals]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [depositOpen, setDepositOpen] = useState(false)
  const [editing, setEditing]     = useState(null)
  const [selected, setSelected]   = useState(null)

  const load = () => {
    setLoading(true)
    goalService.list()
      .then(r => setGoals(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openAdd    = () => { setEditing(null); setModalOpen(true) }
  const openEdit   = g  => { setEditing(g);   setModalOpen(true) }
  const openDeposit = g => { setSelected(g);  setDepositOpen(true) }

  const remove = async id => {
    if (!confirm('Supprimer cet objectif ?')) return
    await goalService.remove(id)
    load()
  }

  const active    = goals.filter(g => g.status === 'active')
  const completed = goals.filter(g => g.status === 'completed')

  const GoalCard = ({ g }) => {
    const pct      = g.progress_percent ?? 0
    const done     = g.is_completed
    const daysLeft = g.deadline
      ? Math.ceil((new Date(g.deadline) - new Date()) / 86400000)
      : null

    return (
      <div className={`bg-white border rounded-2xl p-5 transition group ${done ? 'border-emerald-100' : 'border-gray-100'}`}>

        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-bold text-gray-900">{g.title}</p>
              {done && (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Atteint
                </span>
              )}
            </div>
            {g.description && <p className="text-xs text-gray-400">{g.description}</p>}
          </div>
          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition flex-shrink-0 ml-2">
            {!done && (
              <button onClick={() => openDeposit(g)}
                className="text-xs text-gray-400 hover:text-emerald-600 border border-gray-200 px-2 py-1 rounded-md transition">
                Épargner
              </button>
            )}
            <button onClick={() => openEdit(g)}
              className="text-xs text-gray-400 hover:text-gray-900 border border-gray-200 px-2 py-1 rounded-md transition">
              Modifier
            </button>
            <button onClick={() => remove(g.id)}
              className="text-xs text-gray-400 hover:text-red-500 border border-gray-200 px-2 py-1 rounded-md transition">
              Supprimer
            </button>
          </div>
        </div>

        {/* Barre progression */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-400">{fmt(g.current_amount)}</span>
            <span className="text-xs font-bold text-gray-700">{pct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="h-2 rounded-full transition-all"
              style={{ width: `${pct}%`, background: done ? '#10b981' : '#111827' }} />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Objectif : {fmt(g.target_amount)}</p>
        </div>

        {/* Infos bas */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Restant : <span className="font-semibold text-gray-700">{fmt(g.remaining_amount ?? 0)}</span>
          </span>
          {daysLeft !== null && !done && (
            <span className={`text-xs font-semibold ${daysLeft < 7 ? 'text-red-500' : 'text-gray-400'}`}>
              {daysLeft > 0 ? `${daysLeft} jour(s)` : 'Délai dépassé'}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Objectifs d'épargne</h1>
          <p className="text-sm text-gray-400 mt-1">Suivez votre progression vers vos projets</p>
        </div>
        <button onClick={openAdd}
          className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          + Nouvel objectif
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
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
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                En cours — {active.length}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {active.map(g => <GoalCard key={g.id} g={g} />)}
              </div>
            </div>
          )}
          {completed.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Atteints — {completed.length}
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