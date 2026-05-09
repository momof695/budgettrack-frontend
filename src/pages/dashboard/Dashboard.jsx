// Fichier : src/pages/dashboard/Dashboard.jsx

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dashboardService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  Tooltip, XAxis, YAxis, ResponsiveContainer
} from 'recharts'

const fmt  = n => new Intl.NumberFormat('fr-FR').format(Math.round(n))
const fmtF = n => fmt(n) + ' FCFA'
const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']

function Icon({ path, className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-xs">
      <p className="font-bold text-gray-700 mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-500">{p.name === 'income' ? 'Revenus' : 'Dépenses'}</span>
          <span className="font-semibold text-gray-800 ml-auto">{fmtF(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
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
      <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!data) return (
    <div className="text-center py-20 text-gray-400 text-sm">Impossible de charger les données.</div>
  )

  const chartData = (() => {
    const map = {}
    data.monthly_chart?.forEach(({ month, year, type, total }) => {
      const key = `${year}-${month}`
      if (!map[key]) map[key] = { name: MONTHS[month - 1], income: 0, expense: 0 }
      map[key][type] = parseFloat(total)
    })
    return Object.values(map)
  })()

  const pieData = data.by_category?.map(c => ({ name: c.category, value: parseFloat(c.total), color: c.color })) ?? []

  const balance     = data.balance ?? 0
  const income      = data.monthly_income ?? 0
  const expense     = data.monthly_expense ?? 0
  const savingRate  = income > 0 ? Math.round(((income - expense) / income) * 100) : 0
  const firstName   = user?.name?.split(' ')[0] ?? 'vous'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  return (
    <div className="space-y-6">

      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 font-medium">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-2xl font-bold text-gray-900 mt-0.5">{greeting}, {firstName}</h1>
        </div>
        <Link to="/transactions"
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
          <Icon path="M12 4v16m8-8H4" className="w-3.5 h-3.5" />
          Ajouter
        </Link>
      </div>

      {/* ── Hero card solde ───────────────────────────────── */}
      <div className="relative bg-gray-900 rounded-2xl p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="relative">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Solde total</p>
          <p className="text-4xl font-black text-white tracking-tight">{fmt(balance)}</p>
          <p className="text-gray-500 text-sm mt-1">FCFA</p>
          <div className="flex gap-6 mt-6 pt-5 border-t border-white/10">
            <div>
              <p className="text-xs text-gray-500 mb-1">Revenus ce mois</p>
              <p className="text-sm font-bold text-emerald-400">+{fmtF(income)}</p>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <p className="text-xs text-gray-500 mb-1">Dépenses ce mois</p>
              <p className="text-sm font-bold text-red-400">-{fmtF(expense)}</p>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <p className="text-xs text-gray-500 mb-1">Taux d'épargne</p>
              <p className={`text-sm font-bold ${savingRate >= 10 ? 'text-blue-400' : 'text-orange-400'}`}>{savingRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Graphiques ────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Évolution */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Évolution financière</h2>
              <p className="text-xs text-gray-400 mt-0.5">6 derniers mois</p>
            </div>
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-900 inline-block" /> Revenus
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" /> Dépenses
              </span>
            </div>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#111827" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f87171" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                  tickFormatter={v => v >= 1000 ? `${Math.round(v / 1000)}k` : v} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income"  stroke="#111827" strokeWidth={2.5} fill="url(#gIncome)"  dot={false} name="income" />
                <Area type="monotone" dataKey="expense" stroke="#f87171" strokeWidth={2.5} fill="url(#gExpense)" dot={false} name="expense" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-200 text-sm">
              Aucune donnée disponible
            </div>
          )}
        </div>

        {/* Pie catégories */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-gray-900">Par catégorie</h2>
            <p className="text-xs text-gray-400 mt-0.5">Dépenses ce mois</p>
          </div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                    dataKey="value" paddingAngle={3} strokeWidth={0}>
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={v => fmtF(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {pieData.slice(0, 4).map((c, i) => {
                  const total = pieData.reduce((s, x) => s + x.value, 0)
                  const pct   = total > 0 ? Math.round((c.value / total) * 100) : 0
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                      <span className="text-xs text-gray-500 flex-1 truncate">{c.name}</span>
                      <span className="text-xs font-semibold text-gray-400">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-gray-200 text-sm gap-2">
              <Icon path="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" className="w-8 h-8 text-gray-200" />
              Aucune dépense
            </div>
          )}
        </div>
      </div>

      {/* ── Dernières transactions ────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Dernières transactions</h2>
            <p className="text-xs text-gray-400 mt-0.5">Activité récente</p>
          </div>
          <Link to="/transactions" className="text-xs font-semibold text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-1">
            Voir tout <Icon path="M9 5l7 7-7 7" className="w-3 h-3" />
          </Link>
        </div>
        {data.recent?.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {data.recent.map(tx => (
              <div key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
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
                    {new Date(tx.transaction_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    {tx.category && <> · {tx.category.name}</>}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {tx.type === 'income' ? '+' : '-'}{fmtF(tx.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-14">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Icon path="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" className="w-5 h-5 text-gray-300" />
            </div>
            <p className="text-gray-300 text-sm mb-3">Aucune transaction</p>
            <Link to="/transactions"
              className="text-xs font-semibold text-gray-900 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Ajouter une transaction
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}