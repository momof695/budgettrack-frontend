// Fichier : src/pages/categories/Categories.jsx

import { useEffect, useState } from 'react'
import { categoryService } from '../../services/api'

const fmtF = n => new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' FCFA'

const COLORS = [
  '#111827','#ef4444','#f97316','#eab308',
  '#22c55e','#10b981','#3b82f6','#8b5cf6','#ec4899','#6b7280'
]

const EMPTY_FORM = { name: '', color: '#111827', budget_limit: '', type: 'expense' }

function Icon({ path, className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  )
}

function CategoryModal({ open, onClose, onSaved, editing }) {
  const [form, setForm]     = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(editing ? {
      name:         editing.name ?? '',
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

  const inputCls = "w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition placeholder-gray-300"
  const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md p-6 z-10">
        <div className="sm:hidden w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-gray-900">
            {editing ? 'Modifier' : 'Nouvelle catégorie'}
          </h2>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 transition">
            <Icon path="M6 18L18 6M6 6l12 12" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">

          {/* Type */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-50 rounded-xl">
            {['expense', 'income'].map(t => (
              <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
                className={`py-2.5 rounded-lg text-sm font-semibold transition-all
                  ${form.type === t
                    ? t === 'expense'
                      ? 'bg-white shadow-sm text-red-600 border border-red-100'
                      : 'bg-white shadow-sm text-emerald-600 border border-emerald-100'
                    : 'text-gray-400 hover:text-gray-600'}`}>
                {t === 'expense' ? 'Dépense' : 'Revenu'}
              </button>
            ))}
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
            <div className="flex gap-2.5 flex-wrap">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                  className={`w-8 h-8 rounded-full transition-all duration-150 ${form.color === c ? 'ring-2 ring-offset-2 ring-gray-900 scale-110' : 'hover:scale-105'}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>

          {/* Budget limite */}
          {form.type === 'expense' && (
            <div>
              <label className={labelCls}>
                Budget mensuel <span className="normal-case font-normal text-gray-300">(optionnel)</span>
              </label>
              <input type="number" name="budget_limit" value={form.budget_limit} onChange={handle}
                placeholder="Ex: 50 000" min="0" className={inputCls} />
            </div>
          )}

          <button type="submit" disabled={saving}
            className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 text-white text-sm font-semibold py-3.5 rounded-xl transition-colors">
            {saving ? 'Enregistrement...' : editing ? 'Modifier' : 'Créer la catégorie'}
          </button>
        </form>
      </div>
    </div>
  )
}

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
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catégories</h1>
          <p className="text-sm text-gray-400 mt-0.5">Organisez vos revenus et dépenses</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
          <Icon path="M12 4v16m8-8H4" className="w-3.5 h-3.5" />
          Créer
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[{ value: 'expense', label: 'Dépenses' }, { value: 'income', label: 'Revenus' }].map(t => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all
              ${tab === t.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}>
            {t.label}
            <span className={`ml-1.5 text-xs ${tab === t.value ? 'text-gray-400' : 'text-gray-300'}`}>
              {categories.filter(c => c.type === t.value).length}
            </span>
          </button>
        ))}
      </div>

      {/* Grille */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Icon path="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" className="w-5 h-5 text-gray-300" />
          </div>
          <p className="text-gray-300 text-sm mb-3">Aucune catégorie</p>
          <button onClick={openAdd}
            className="text-xs font-semibold text-gray-900 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
            Créer une catégorie
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(cat => {
            const usage      = cat.budget_limit ? Math.min(100, Math.round(((cat.monthly_spent ?? 0) / cat.budget_limit) * 100)) : null
            const overBudget = usage !== null && usage >= 100
            return (
              <div key={cat.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group">

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: cat.color + '18' }}>
                      <div className="w-3.5 h-3.5 rounded-full" style={{ background: cat.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{cat.name}</p>
                      <p className="text-xs text-gray-400">{cat.transactions_count ?? 0} transaction(s)</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(cat)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition">
                      <Icon path="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" className="w-3.5 h-3.5" />
                    </button>
                    {!cat.is_default && (
                      <button onClick={() => remove(cat.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition">
                        <Icon path="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {cat.budget_limit && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-400">Budget mensuel</span>
                      <span className={`text-xs font-bold ${overBudget ? 'text-red-500' : 'text-gray-600'}`}>{usage}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${usage}%`, background: overBudget ? '#ef4444' : cat.color }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">Plafond : {fmtF(cat.budget_limit)}</p>
                    {overBudget && (
                      <p className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1">
                        <Icon path="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" className="w-3 h-3" />
                        Budget dépassé
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <CategoryModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={load} editing={editing} />
    </div>
  )
}