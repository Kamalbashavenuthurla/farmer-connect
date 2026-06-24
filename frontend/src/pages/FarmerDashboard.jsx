import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api, { API_URL } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Plus, Eye, Edit, Trash2, Package, TrendingUp, MessageCircle, Users } from 'lucide-react'

export default function FarmerDashboard() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/products/farmer/my-products'),
      api.get(`/users/farmer/${user.id}/stats`)
    ]).then(([pr, sr]) => {
      setProducts(pr.data.products)
      setStats(sr.data)
    }).finally(() => setLoading(false))
  }, [user.id])

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return
    await api.delete(`/products/${id}`)
    setProducts(prev => prev.filter(p => p.id !== id))
    toast.success('Product deleted')
  }

  const toggleAvailable = async (id, current) => {
    await api.put(`/products/${id}`, { is_available: !current })
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_available: !current } : p))
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Farmer Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user.name} 👨‍🌾</p>
        </div>
        <Link to="/farmer/products/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} />Add Product
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Products', value: stats.total_products, icon: Package, color: 'blue' },
            { label: 'Active Listings', value: stats.active_products, icon: TrendingUp, color: 'green' },
            { label: 'Total Views', value: stats.total_views, icon: Eye, color: 'purple' },
            { label: 'Enquiries', value: stats.total_enquiries, icon: MessageCircle, color: 'orange' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card">
              <div className={`w-8 h-8 bg-${color}-100 rounded-lg flex items-center justify-center mb-2`}>
                <Icon size={16} className={`text-${color}-600`} />
              </div>
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-xs text-gray-400">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Quick links */}
      <div className="flex gap-3 mb-6">
        <Link to="/farmer/enquiries" className="btn-secondary flex items-center gap-2 text-sm">
          <MessageCircle size={16} />View Enquiries
        </Link>
        <Link to="/messages" className="btn-secondary flex items-center gap-2 text-sm">
          <Users size={16} />Messages
        </Link>
      </div>

      {/* Products table */}
      <div className="card overflow-hidden p-0">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">My Products ({products.length})</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <Package size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No products yet</p>
            <Link to="/farmer/products/new" className="btn-primary inline-flex mt-4 gap-2 items-center"><Plus size={16} />Add your first product</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Qty</th>
                  <th className="px-4 py-3 text-left">Views</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {p.images?.[0] ? <img src={`${API_URL}${p.images[0]}`} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">🌾</div>}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{p.name}</div>
                          <div className="text-xs text-gray-400">{p.category_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-700">₹{p.price}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{p.quantity} {p.quantity_unit}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{p.views}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleAvailable(p.id, p.is_available)}
                        className={`text-xs px-2 py-1 rounded-full font-medium ${p.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.is_available ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link to={`/farmer/products/${p.id}/edit`} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                          <Edit size={15} />
                        </Link>
                        <button onClick={() => deleteProduct(p.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
