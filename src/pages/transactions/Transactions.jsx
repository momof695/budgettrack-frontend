// Fichier : src/pages/transactions/Transactions.jsx

import { useEffect, useState } from 'react'
import { transactionService, categoryService } from '../../services/api'

const fmt  = n => new Intl.NumberFormat('fr-FR').format(Math.round(n))
const fmtF = n => fmt(n) + ' FCFA'

const PAYMENT_METHODS = [
  { value: 'cash',         label: 'Espèces' },
  { value: 'orange_money', label: 'Orange Money' },
  { value: 'moov_money',   label: 'Moov Money' },
  { value: 'bank',         label: 'Virement bancaire' },
  { value: 'other',        label: 'Autre' },
]

const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

const EMPTY_FORM = {
  amount: '', type: 'expense', category_id: '',
  description: '', transaction_date: new Date().toISOString().split('T')[0],
  payment_method: 'cash', reference: '',
}

function Icon({ path, className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  )
}

// ── Modal ──────────────────────────────────────────────────
function TransactionModal({ open, onClose, onSaved, categories, editing }) {
  const [form, setForm]     = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editing) {
      setForm({
        amount:           editing.amount ?? '',
        type:             editing.type ?? 'expense',
        category_id:      editing.category_id ?? '',
        description:      editing.description ?? '',
        transaction_date: editing.transaction_date?.split('T')[0] ?? new Date().toISOString().split('T')[0],
        payment_method:   editing.payment_method ?? 'cash',
        reference:        editing.reference ?? '',
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setErrors({})
  }, [editing, open])

  if (!open) return null

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async e => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      if (editing) await transactionService.update(editing.id, form)
      else         await transactionService.create(form)
      onSaved()
      onClose()
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors)
    } finally {
      setSaving(false)
    }
  }

  const [showMore, setShowMore] = useState(false)
  const inputCls = "w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition placeholder-gray-300"
  const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
  const filteredCats = categories.filter(c => c.type === form.type)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md p-6 z-10 max-h-[92vh] overflow-y-auto">

        {/* Handle mobile */}
        <div className="sm:hidden w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-gray-900">
            {editing ? 'Modifier' : 'Nouvelle transaction'}
          </h2>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition">
            <Icon path="M6 18L18 6M6 6l12 12" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">

          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-50 rounded-xl">
            {['expense', 'income'].map(t => (
              <button key={t} type="button" onClick={() => setForm({ ...form, type: t, category_id: '' })}
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

          {/* Montant */}
          <div>
            <label className={labelCls}>Montant (FCFA)</label>
            <input type="number" name="amount" value={form.amount} onChange={handle}
              placeholder="0" min="1" required className={inputCls} />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount[0]}</p>}
          </div>

          {/* Catégorie */}
          <div>
            <label className={labelCls}>Catégorie</label>
            <select name="category_id" value={form.category_id} onChange={handle} className={inputCls}>
              <option value="">Sans catégorie</option>
              {filteredCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className={labelCls}>Date</label>
            <input type="date" name="transaction_date" value={form.transaction_date} onChange={handle}
              required className={inputCls} />
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Description <span className="normal-case font-normal text-gray-300">(optionnel)</span></label>
            <input type="text" name="description" value={form.description} onChange={handle}
              placeholder="Ex: Marché, carburant..." className={inputCls} />
          </div>

          {/* Plus d'options */}
          <button type="button" onClick={() => setShowMore(!showMore)}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-700 transition font-medium">
            <Icon path={showMore ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} className="w-3.5 h-3.5" />
            {showMore ? "Moins d'options" : "Plus d'options"}
          </button>

          {showMore && (
            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Paiement</label>
                  <select name="payment_method" value={form.payment_method} onChange={handle} className={inputCls}>
                    {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                {['orange_money', 'moov_money'].includes(form.payment_method) && (
                  <div>
                    <label className={labelCls}>Référence</label>
                    <input type="text" name="reference" value={form.reference} onChange={handle}
                      placeholder="OM-XXXXXXXX" className={inputCls} />
                  </div>
                )}
              </div>
            </div>
          )}

          <button type="submit" disabled={saving}
            className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold py-3.5 rounded-xl transition-colors mt-2">
            {saving ? 'Enregistrement...' : editing ? 'Modifier' : 'Ajouter la transaction'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Page Transactions ──────────────────────────────────────
export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories]     = useState([])
  const [loading, setLoading]           = useState(true)
  const [modalOpen, setModalOpen]       = useState(false)
  const [editing, setEditing]           = useState(null)
  const [filter, setFilter]             = useState({ type: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() })
  const [page, setPage]                 = useState(1)
  const [meta, setMeta]                 = useState(null)

  const load = () => {
    setLoading(true)
    transactionService.list({ ...filter, page })
      .then(r => { setTransactions(r.data.data); setMeta(r.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { categoryService.list().then(r => setCategories(r.data)) }, [])
  useEffect(() => { load() }, [filter, page])

  const openAdd  = () => { setEditing(null); setModalOpen(true) }
  const openEdit = tx  => { setEditing(tx);  setModalOpen(true) }

  const remove = async id => {
    if (!confirm('Supprimer cette transaction ?')) return
    await transactionService.remove(id)
    load()
  }

  const totalIncome  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-sm text-gray-400 mt-0.5">Historique de vos revenus et dépenses</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
          <Icon path="M12 4v16m8-8H4" className="w-3.5 h-3.5" />
          Ajouter
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Icon path="M7 11l5-5m0 0l5 5m-5-5v12" className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Revenus</p>
          </div>
          <p className="text-xl font-bold text-emerald-600">+{fmtF(totalIncome)}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
              <Icon path="M17 13l-5 5m0 0l-5-5m5 5V6" className="w-3.5 h-3.5 text-red-400" />
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dépenses</p>
          </div>
          <p className="text-xl font-bold text-red-500">-{fmtF(totalExpense)}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-wrap gap-2">
        <select value={filter.type} onChange={e => setFilter({ ...filter, type: e.target.value })}
          className="border border-gray-100 bg-gray-50 rounded-xl px-3 py-2 text-xs font-medium text-gray-600 focus:outline-none focus:border-gray-900 transition">
          <option value="">Tous les types</option>
          <option value="income">Revenus</option>
          <option value="expense">Dépenses</option>
        </select>
        <select value={filter.month} onChange={e => setFilter({ ...filter, month: e.target.value })}
          className="border border-gray-100 bg-gray-50 rounded-xl px-3 py-2 text-xs font-medium text-gray-600 focus:outline-none focus:border-gray-900 transition">
          {MONTHS_FR.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select value={filter.year} onChange={e => setFilter({ ...filter, year: e.target.value })}
          className="border border-gray-100 bg-gray-50 rounded-xl px-3 py-2 text-xs font-medium text-gray-600 focus:outline-none focus:border-gray-900 transition">
          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Liste */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Icon path="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" className="w-5 h-5 text-gray-300" />
            </div>
            <p className="text-gray-300 text-sm mb-3">Aucune transaction trouvée</p>
            <button onClick={openAdd}
              className="text-xs font-semibold text-gray-900 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
              Ajouter une transaction
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors group">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                  ${tx.type === 'income' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                  <Icon
                    path={tx.type === 'income' ? 'M7 11l5-5m0 0l5 5m-5-5v12' : 'M17 13l-5 5m0 0l-5-5m5 5V6'}
                    className={`w-4 h-4 ${tx.type === 'income' ? 'text-emerald-500' : 'text-red-400'}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {tx.description || tx.category?.name || 'Transaction'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(tx.transaction_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {tx.category && <> · {tx.category.name}</>}
                    {' · '}{PAYMENT_METHODS.find(m => m.value === tx.payment_method)?.label ?? 'Espèces'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {tx.type === 'income' ? '+' : '-'}{fmtF(tx.amount)}
                  </span>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(tx)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition">
                      <Icon path="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => remove(tx.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition">
                      <Icon path="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50">
            <p className="text-xs text-gray-400">Page {meta.current_page} sur {meta.last_page}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition">
                Précédent
              </button>
              <button disabled={page === meta.last_page} onClick={() => setPage(p => p + 1)}
                className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition">
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      <TransactionModal
        open={modalOpen} onClose={() => setModalOpen(false)}
        onSaved={load} categories={categories} editing={editing}
      />
    </div>
  )
}