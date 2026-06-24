import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function EditProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get(`/products/${id}`).then(r => setForm({
      name: r.data.name, description: r.data.description || '',
      quantity: r.data.quantity, quantity_unit: r.data.quantity_unit,
      price: r.data.price, price_unit: r.data.price_unit,
      is_organic: r.data.is_organic, is_available: r.data.is_available,
    }))
  }, [id])

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put(`/products/${id}`, form)
      toast.success('Product updated!')
      navigate('/farmer')
    } catch { toast.error('Update failed') }
    finally { setLoading(false) }
  }

  if (!form) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" /></div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <form onSubmit={submit} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea className="input-field resize-none" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price (₹)</label>
            <input className="input-field" type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price Unit</label>
            <select className="input-field" value={form.price_unit} onChange={e => setForm(p => ({ ...p, price_unit: e.target.value }))}>
              {['per kg', 'per quintal', 'per piece', 'per dozen', 'per litre', 'per bundle'].map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input className="input-field" type="number" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Unit</label>
            <select className="input-field" value={form.quantity_unit} onChange={e => setForm(p => ({ ...p, quantity_unit: e.target.value }))}>
              {['kg', 'quintal', 'tonne', 'litre', 'piece', 'dozen', 'bundle'].map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_organic} onChange={e => setForm(p => ({ ...p, is_organic: e.target.checked }))} className="accent-green-600 w-4 h-4" />
            <span className="text-sm">Organic</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_available} onChange={e => setForm(p => ({ ...p, is_available: e.target.checked }))} className="accent-green-600 w-4 h-4" />
            <span className="text-sm">Available</span>
          </label>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate('/farmer')} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </form>
    </div>
  )
}
