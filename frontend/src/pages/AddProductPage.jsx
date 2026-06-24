import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { Upload, X, MapPin } from 'lucide-react'

export default function AddProductPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', category_id: '', description: '', quantity: '', quantity_unit: 'kg',
    price: '', price_unit: 'per kg', harvest_date: '', is_organic: false, lat: '', lng: ''
  })

  useEffect(() => { api.get('/categories').then(r => setCategories(r.data)) }, [])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleImages = (e) => {
    const files = Array.from(e.target.files)
    setImages(prev => [...prev, ...files].slice(0, 5))
    files.forEach(f => {
      const reader = new FileReader()
      reader.onload = (ev) => setPreviews(prev => [...prev, ev.target.result].slice(0, 5))
      reader.readAsDataURL(f)
    })
  }

  const removeImage = (i) => {
    setImages(prev => prev.filter((_, idx) => idx !== i))
    setPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  const getLocation = () => {
    navigator.geolocation?.getCurrentPosition(pos => {
      set('lat', pos.coords.latitude.toFixed(6))
      set('lng', pos.coords.longitude.toFixed(6))
      toast.success('Location captured')
    })
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v) })
      images.forEach(img => fd.append('images', img))
      await api.post('/products/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Product listed successfully!')
      navigate('/farmer')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add product')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
      <form onSubmit={submit} className="card space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Product Name *</label>
          <input className="input-field" placeholder="e.g. Fresh Tomatoes" required value={form.name} onChange={e => set('name', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select className="input-field" required value={form.category_id} onChange={e => set('category_id', e.target.value)}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer pb-2">
              <input type="checkbox" className="w-4 h-4 rounded accent-green-600" checked={form.is_organic} onChange={e => set('is_organic', e.target.checked)} />
              <span className="text-sm font-medium">🌿 Organic</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea className="input-field resize-none" rows={3} placeholder="Describe your product..." value={form.description} onChange={e => set('description', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price (₹) *</label>
            <input className="input-field" type="number" min="0" step="0.01" placeholder="50" required value={form.price} onChange={e => set('price', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price Unit</label>
            <select className="input-field" value={form.price_unit} onChange={e => set('price_unit', e.target.value)}>
              {['per kg', 'per quintal', 'per piece', 'per dozen', 'per litre', 'per bundle'].map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantity *</label>
            <input className="input-field" type="number" min="0" step="0.1" placeholder="100" required value={form.quantity} onChange={e => set('quantity', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Unit</label>
            <select className="input-field" value={form.quantity_unit} onChange={e => set('quantity_unit', e.target.value)}>
              {['kg', 'quintal', 'tonne', 'litre', 'piece', 'dozen', 'bundle'].map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Harvest Date</label>
          <input className="input-field" type="date" value={form.harvest_date} onChange={e => set('harvest_date', e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Farm Location</label>
          <button type="button" onClick={getLocation}
            className="flex items-center gap-2 text-sm text-green-600 border border-dashed border-green-300 rounded-lg px-4 py-2 hover:bg-green-50 transition-colors">
            <MapPin size={16} />{form.lat ? `${form.lat}, ${form.lng}` : 'Use my current location'}
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Product Images (up to 5)</label>
          <div className="flex gap-3 flex-wrap">
            {previews.map((src, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                  <X size={12} />
                </button>
              </div>
            ))}
            {previews.length < 5 && (
              <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors">
                <Upload size={20} className="text-gray-400" />
                <span className="text-xs text-gray-400 mt-1">Upload</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
              </label>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate('/farmer')} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Adding...' : 'Add Product'}</button>
        </div>
      </form>
    </div>
  )
}
