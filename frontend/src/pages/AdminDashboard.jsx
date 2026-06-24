import { useState, useEffect } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { Users, Package, CheckCircle, ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/admin/dashboard'), api.get('/admin/users')])
      .then(([s, u]) => { setStats(s.data); setUsers(u.data.users) })
      .finally(() => setLoading(false))
  }, [])

  const verify = async (id) => {
    await api.put(`/admin/users/${id}/verify`)
    setUsers(prev => prev.map(u => u.id === id ? { ...u, is_verified: true } : u))
    toast.success('Farmer verified!')
  }

  const toggleActive = async (id) => {
    const res = await api.put(`/admin/users/${id}/toggle-active`)
    setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: res.data.is_active } : u))
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" /></div>

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            ['Total Users', stats.total_users, 'blue'],
            ['Farmers', stats.total_farmers, 'green'],
            ['Buyers', stats.total_buyers, 'purple'],
            ['Products', stats.total_products, 'orange'],
            ['Enquiries', stats.total_enquiries, 'pink'],
            ['Pending Verify', stats.pending_verification, 'red'],
          ].map(([label, val, color]) => (
            <div key={label} className="card text-center">
              <div className={`text-2xl font-bold text-${color}-600`}>{val}</div>
              <div className="text-xs text-gray-400 mt-1">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {['overview', 'users'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-green-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="card overflow-hidden p-0">
          <div className="p-4 border-b font-semibold">All Users ({users.length})</div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Verified</th>
                  <th className="px-4 py-3 text-left">Active</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm">{u.name}</div>
                      <div className="text-xs text-gray-400">{u.email}</div>
                    </td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${u.role === 'farmer' ? 'bg-green-100 text-green-700' : u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span></td>
                    <td className="px-4 py-3 text-sm text-gray-500">{u.phone}</td>
                    <td className="px-4 py-3">
                      {u.is_verified ? <CheckCircle size={16} className="text-green-500" /> : <span className="text-xs text-gray-400">No</span>}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(u.id)} className={u.is_active ? 'text-green-500' : 'text-gray-300'}>
                        {u.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      {u.role === 'farmer' && !u.is_verified && (
                        <button onClick={() => verify(u.id)} className="flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-lg hover:bg-green-200">
                          <ShieldCheck size={12} />Verify
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
