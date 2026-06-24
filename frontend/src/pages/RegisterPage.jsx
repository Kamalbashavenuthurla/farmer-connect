import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Sprout, MapPin } from 'lucide-react'

export default function RegisterPage() {
  const [params] = useSearchParams()
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    role: params.get('role') || 'buyer',
    village: '', district: '', state: '', lat: '', lng: ''
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const getLocation = () => {
    navigator.geolocation?.getCurrentPosition(pos => {
      setForm(p => ({ ...p, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) }))
      toast.success('Location captured!')
    }, () => toast.error('Location access denied'))
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form, lat: form.lat ? parseFloat(form.lat) : null, lng: form.lng ? parseFloat(form.lng) : null }
      const user = await register(payload)
      toast.success(`Welcome, ${user.name}!`)
      if (user.role === 'farmer') navigate('/farmer')
      else navigate('/products')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="card shadow-lg">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Sprout size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold">Create Account</h1>
            <p className="text-gray-500 text-sm mt-1">Join the FarmerConnect community</p>
          </div>

          {/* Role toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
            {['buyer', 'farmer'].map(r => (
              <button key={r} type="button" onClick={() => set('role', r)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${form.role === r ? 'bg-white shadow text-green-700' : 'text-gray-500'}`}>
                {r === 'buyer' ? '🛒 I\'m a Buyer' : '👨‍🌾 I\'m a Farmer'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input className="input-field" placeholder="kamal" required value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input className="input-field" type="email" placeholder="kamal@example.com" required value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input className="input-field" placeholder="9876543210" required value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Password</label>
                <input className="input-field" type="password" placeholder="At least 6 characters" required minLength={6} value={form.password} onChange={e => set('password', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Village / Town</label>
                <input className="input-field" placeholder="vadlavandla palli" value={form.village} onChange={e => set('village', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">District</label>
                <input className="input-field" placeholder="kadapa" value={form.district} onChange={e => set('district', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <input className="input-field" placeholder="Andrapradesh" value={form.state} onChange={e => set('state', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">GPS Location</label>
                <button type="button" onClick={getLocation}
                  className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 hover:border-green-400 hover:text-green-600 transition-colors">
                  <MapPin size={16} />
                  {form.lat ? `${form.lat}, ${form.lng}` : 'Get my location'}
                </button>
              </div>
            </div>

            <button className="btn-primary w-full py-2.5" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account? <Link to="/login" className="text-green-600 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
