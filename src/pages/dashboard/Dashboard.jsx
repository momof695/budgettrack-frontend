// Fichier : src/pages/dashboard/Dashboard.jsx

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dashboardService } from '../../services/api'
import {
  AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, Tooltip,
  XAxis, YAxis, ResponsiveContainer, Legend
} from 'recharts'

const fmt = n => new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' FCFA'

const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc']

// ── Composants UI ──────────────────────────────────────────

function StatCard({ title, value, sub, positive }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{title}</p>
      <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
      {sub && (
        <p className={`text-xs mt-2 font-medium ${positive ? 'text-emerald-500' : 'text-red-400'}`}>
          {sub}
        </p>
      )}
    </div>
  )
}

function SectionTitle({ title, action, to }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{title}</h2>
      {action && (
        <Link to={to} className="text-xs text-gray-400 hover:text-gray-900 transition font-medium">
          {action} →
        </Link>
      )}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm px-4 py-3 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name === 'income' ? 'Revenus' : 'Dépenses'} : {fmt(p.value)}
        </p>
      ))}
    </div>
  )
}

// ── Page Dashboard ─────────────────────────────────────────

export default function Dashboard() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardService.get()
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!data) return (
    <div className="text-center py-20 text-gray-400 text-sm">Impossible de charger les données.</div>
  )

  // Prépare les données du graphique évolution
  const chartData = (() => {
    const map = {}
    data.monthly_chart?.forEach(({ month, year, type, total }) => {
      const key = `${year}-${month}`
      if (!map[key]) map[key] = { name: MONTHS[month - 1], income: 0, expense: 0 }
      map[key][type] = total
    })
    return Object.values(map)
  })()

  // Données du pie chart catégories
  const pieData = data.by_category?.map(c => ({
    name: c.category,
    value: c.total,
    color: c.color,
  })) ?? []

  const balance  = data.balance ?? 0
  const income   = data.monthly_income ?? 0
  const expense  = data.monthly_expense ?? 0
  const savingRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0

  return (
    <div className="space-y-8">

      {/* ── En-tête ───────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vue d'ensemble</h1>
        <p className="text-sm text-gray-400 mt-1">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* ── Cartes stats ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-2xl p-6 sm:col-span-2 xl:col-span-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Solde actuel</p>
          <p className="text-2xl font-bold text-white leading-none">{fmt(balance)}</p>
          <p className="text-xs mt-2 text-gray-500">Tous comptes confondus</p>
        </div>
        <StatCard
          title="Revenus du mois"
          value={fmt(income)}
          sub={income > 0 ? `+${fmt(income)} ce mois` : 'Aucun revenu'}
          positive
        />
        <StatCard
          title="Dépenses du mois"
          value={fmt(expense)}
          sub={expense > income ? 'Dépassement du budget' : `${savingRate}% d'économies`}
          positive={expense <= income}
        />
        <StatCard
          title="Taux d'épargne"
          value={`${savingRate}%`}
          sub={savingRate >= 20 ? 'Excellent' : savingRate >= 10 ? 'Correct' : 'À améliorer'}
          positive={savingRate >= 10}
        />
      </div>

      {/* ── Graphiques ────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Évolution 6 mois */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <SectionTitle title="Évolution 6 mois" action="Transactions" to="/transactions" />
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#111827" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                  tickFormatter={v => v >= 1000 ? `${Math.round(v/1000)}k` : v} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income"  stroke="#111827" strokeWidth={2} fill="url(#gIncome)"  name="income" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fill="url(#gExpense)" name="expense" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-300 text-sm">
              Aucune donnée disponible
            </div>
          )}
          <div className="flex gap-5 mt-3">
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-900 inline-block" /> Revenus
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" /> Dépenses
            </span>
          </div>
        </div>

        {/* Dépenses par catégorie */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <SectionTitle title="Par catégorie" action="Catégories" to="/categories" />
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                    dataKey="value" paddingAngle={2}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {pieData.slice(0, 4).map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                      <span className="text-gray-600 truncate max-w-[100px]">{c.name}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{fmt(c.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-300 text-sm">
              Aucune dépense ce mois
            </div>
          )}
        </div>
      </div>

      {/* ── Dernières transactions ────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <SectionTitle title="Dernières transactions" action="Voir tout" to="/transactions" />
        {data.recent?.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {data.recent.map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full ${tx.type === 'income' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {tx.description || tx.category?.name || 'Transaction'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(tx.transaction_date).toLocaleDateString('fr-FR')}
                      {tx.category && ` · ${tx.category.name}`}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-300 text-sm mb-3">Aucune transaction pour le moment</p>
            <Link to="/transactions"
              className="text-xs font-semibold text-gray-900 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
              Ajouter une transaction
            </Link>
          </div>
        )}
      </div>

    </div>
  )
}