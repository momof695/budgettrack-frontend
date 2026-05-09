// Fichier : src/pages/transactions/Transactions.jsx

import { useEffect, useState } from 'react'
import { transactionService, categoryService } from '../../services/api'

const fmt = n => new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' FCFA'

const PAYMENT_METHODS = [
  { value: 'cash',         label: 'Espèces' },
  { value: 'orange_money', label: 'Orange Money' },
  { value: 'moov_money',   label: 'Moov Money' },
  { value: 'bank',         label: 'Virement bancaire' },
  { value: 'other',        label: 'Autre' },
]

const EMPTY_FORM = {
  amount: '', type: 'expense', category_id: '',
  description: '', transaction_date: new Date().toISOString().split('T')[0],
  payment_method: 'cash', reference: '',
}

// ── Modal ajout / modification ─────────────────────────────
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

  const inputCls = "w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition"
  const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"

  const filteredCats = categories.filter(c => c.type === form.type)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10 max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-gray-900">
            {editing ? 'Modifier la transaction' : 'Nouvelle transaction'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition text-lg">✕</button>
        </div>

        <form onSubmit={submit} className="space-y-4">

          {/* Type */}
          <div>
            <label className={labelCls}>Type</label>
            <div className="grid grid-cols-2 gap-2">
              {['expense', 'income'].map(t => (
                <button key={t} type="button" onClick={() => setForm({ ...form, type: t, category_id: '' })}
                  className={`py-2.5 rounded-lg text-sm font-semibold transition border
                    ${form.type === t
                      ? t === 'expense' ? 'bg-red-50 border-red-300 text-red-700' : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                  {t === 'expense' ? 'Dépense' : 'Revenu'}
                </button>
              ))}
            </div>
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
              {filteredCats.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className={labelCls}>Date</label>
            <input type="date" name="transaction_date" value={form.transaction_date} onChange={handle}
              required className={inputCls} />
          </div>

          {/* Mode de paiement */}
          <div>
            <label className={labelCls}>Mode de paiement</label>
            <select name="payment_method" value={form.payment_method} onChange={handle} className={inputCls}>
              {PAYMENT_METHODS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Description <span className="normal-case font-normal text-gray-400">(optionnel)</span></label>
            <input type="text" name="description" value={form.description} onChange={handle}
              placeholder="Ex: Marché, carburant..." className={inputCls} />
          </div>

          {/* Référence mobile money */}
          {['orange_money', 'moov_money'].includes(form.payment_method) && (
            <div>
              <label className={labelCls}>Référence transaction</label>
              <input type="text" name="reference" value={form.reference} onChange={handle}
                placeholder="Ex: OM-XXXXXXXX" className={inputCls} />
            </div>
          )}

          <button type="submit" disabled={saving}
            className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white text-sm font-semibold py-3 rounded-lg transition-colors mt-2">
            {saving ? 'Enregistrement...' : editing ? 'Modifier' : 'Ajouter'}
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

  const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

  return (
    <div className="space-y-6">

      {/* ── En-tête ───────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-sm text-gray-400 mt-1">Historique de vos revenus et dépenses</p>
        </div>
        <button onClick={openAdd}
          className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          + Ajouter
        </button>
      </div>

      {/* ── Résumé rapide ─────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Revenus</p>
          <p className="text-xl font-bold text-emerald-600">{fmt(totalIncome)}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Dépenses</p>
          <p className="text-xl font-bold text-red-500">{fmt(totalExpense)}</p>
        </div>
      </div>

      {/* ── Filtres ───────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-wrap gap-3">
        <select value={filter.type} onChange={e => setFilter({ ...filter, type: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-gray-900 bg-gray-50">
          <option value="">Tous les types</option>
          <option value="income">Revenus</option>
          <option value="expense">Dépenses</option>
        </select>
        <select value={filter.month} onChange={e => setFilter({ ...filter, month: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-gray-900 bg-gray-50">
          {MONTHS_FR.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select value={filter.year} onChange={e => setFilter({ ...filter, year: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-gray-900 bg-gray-50">
          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* ── Liste ─────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-300 text-sm mb-3">Aucune transaction trouvée</p>
            <button onClick={openAdd}
              className="text-xs font-semibold text-gray-900 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
              Ajouter une transaction
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition group">
                <div className="flex items-center gap-4">
                  <div className={`w-1 h-8 rounded-full flex-shrink-0 ${tx.type === 'income' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {tx.description || tx.category?.name || 'Transaction'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(tx.transaction_date).toLocaleDateString('fr-FR')}
                      {tx.category && <> · <span>{tx.category.name}</span></>}
                      {' · '}{PAYMENT_METHODS.find(m => m.value === tx.payment_method)?.label ?? 'Espèces'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                  </span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => openEdit(tx)}
                      className="text-xs text-gray-400 hover:text-gray-900 border border-gray-200 px-2.5 py-1 rounded-md transition">
                      Modifier
                    </button>
                    <button onClick={() => remove(tx.id)}
                      className="text-xs text-gray-400 hover:text-red-500 border border-gray-200 px-2.5 py-1 rounded-md transition">
                      Supprimer
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

      {/* Modal */}
      <TransactionModal
        open={modalOpen} onClose={() => setModalOpen(false)}
        onSaved={load} categories={categories} editing={editing}
      />
    </div>
  )
}