// Fichier : src/pages/categories/Categories.jsx

import { useEffect, useState } from 'react'
import { categoryService } from '../../services/api'

const fmt = n => new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' FCFA'

const COLORS = [
  '#111827','#ef4444','#f97316','#eab308',
  '#22c55e','#10b981','#3b82f6','#8b5cf6','#ec4899','#6b7280'
]

const EMPTY_FORM = { name: '', icon: '', color: '#111827', budget_limit: '', type: 'expense' }

// ── Modal ──────────────────────────────────────────────────
function CategoryModal({ open, onClose, onSaved, editing }) {
  const [form, setForm]     = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(editing ? {
      name:         editing.name ?? '',
      icon:         editing.icon ?? '',
      color:        editing.color ?? '#111827',
      budget_limit: editing.budget_limit ?? '',
      type:         editing.type ?? 'expense',
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
      if (editing) await categoryService.update(editing.id, form)
      else         await categoryService.create(form)
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
            {editing ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">✕</button>
        </div>

        <form onSubmit={submit} className="space-y-4">

          {/* Type */}
          <div>
            <label className={labelCls}>Type</label>
            <div className="grid grid-cols-2 gap-2">
              {['expense', 'income'].map(t => (
                <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
                  className={`py-2.5 rounded-lg text-sm font-semibold transition border
                    ${form.type === t
                      ? t === 'expense' ? 'bg-red-50 border-red-300 text-red-700' : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                  {t === 'expense' ? 'Dépense' : 'Revenu'}
                </button>
              ))}
            </div>
          </div>

          {/* Nom */}
          <div>
            <label className={labelCls}>Nom</label>
            <input type="text" name="name" value={form.name} onChange={handle}
              placeholder="Ex: Nourriture, Transport..." required className={inputCls} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
          </div>

          {/* Couleur */}
          <div>
            <label className={labelCls}>Couleur</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                  className={`w-7 h-7 rounded-full transition border-2 ${form.color === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>

          {/* Budget limite */}
          {form.type === 'expense' && (
            <div>
              <label className={labelCls}>
                Budget mensuel <span className="normal-case font-normal text-gray-400">(optionnel)</span>
              </label>
              <input type="number" name="budget_limit" value={form.budget_limit} onChange={handle}
                placeholder="Ex: 50000" min="0" className={inputCls} />
              <p className="text-xs text-gray-400 mt-1">Recevez une alerte si ce plafond est dépassé</p>
            </div>
          )}

          <button type="submit" disabled={saving}
            className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white text-sm font-semibold py-3 rounded-lg transition-colors">
            {saving ? 'Enregistrement...' : editing ? 'Modifier' : 'Créer'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Page Catégories ────────────────────────────────────────
export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [modalOpen, setModalOpen]   = useState(false)
  const [editing, setEditing]       = useState(null)
  const [tab, setTab]               = useState('expense')

  const load = () => {
    setLoading(true)
    categoryService.list()
      .then(r => setCategories(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openAdd  = () => { setEditing(null); setModalOpen(true) }
  const openEdit = c  => { setEditing(c);   setModalOpen(true) }

  const remove = async id => {
    if (!confirm('Supprimer cette catégorie ?')) return
    await categoryService.remove(id)
    load()
  }

  const filtered = categories.filter(c => c.type === tab)

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catégories</h1>
          <p className="text-sm text-gray-400 mt-1">Organisez vos revenus et dépenses</p>
        </div>
        <button onClick={openAdd}
          className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          + Créer
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[{ value: 'expense', label: 'Dépenses' }, { value: 'income', label: 'Revenus' }].map(t => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors
              ${tab === t.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Grille */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-300 text-sm mb-3">Aucune catégorie</p>
          <button onClick={openAdd}
            className="text-xs font-semibold text-gray-900 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
            Créer une catégorie
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(cat => {
            const usage = cat.budget_limit
              ? Math.min(100, Math.round((cat.monthly_spent / cat.budget_limit) * 100))
              : null
            const overBudget = usage !== null && usage >= 100

            return (
              <div key={cat.id}
                className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition group">

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: cat.color + '18' }}>
                      <div className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{cat.name}</p>
                      <p className="text-xs text-gray-400">{cat.transactions_count ?? 0} transaction(s)</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => openEdit(cat)}
                      className="text-xs text-gray-400 hover:text-gray-900 border border-gray-200 px-2 py-1 rounded-md transition">
                      Modifier
                    </button>
                    {!cat.is_default && (
                      <button onClick={() => remove(cat.id)}
                        className="text-xs text-gray-400 hover:text-red-500 border border-gray-200 px-2 py-1 rounded-md transition">
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>

                {/* Barre de budget */}
                {cat.budget_limit && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-400">Budget mensuel</span>
                      <span className={`text-xs font-semibold ${overBudget ? 'text-red-500' : 'text-gray-700'}`}>
                        {usage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all"
                        style={{ width: `${usage}%`, background: overBudget ? '#ef4444' : cat.color }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">
                      Plafond : {fmt(cat.budget_limit)}
                    </p>
                    {overBudget && (
                      <p className="text-xs text-red-500 font-medium mt-1">Budget dépassé ce mois</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <CategoryModal
        open={modalOpen} onClose={() => setModalOpen(false)}
        onSaved={load} editing={editing}
      />
    </div>
  )
}