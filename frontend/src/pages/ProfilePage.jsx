import { useState, useEffect } from 'react'
import api, { API_URL } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { User, Upload, MapPin, CheckCircle } from 'lucide-react'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', village: user?.village || '', district: user?.district || '', state: user?.state || '', lat: user?.lat || '', lng: user?.lng || '' })
  const [loading, setLoading] = useState(false)

  const getLocation = () => {
    navigator.geolocation?.getCurrentPosition(pos => {
      setForm(p => ({ ...p, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) }))
      toast.success('Location updated')
    })
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put('/users/me', form)
      await refreshUser()
      toast.success('Profile updated!')
    } catch { toast.error('Update failed') }
    finally { setLoading(false) }
  }

  const uploadPhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('photo', file)
    const res = await api.post('/users/me/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    await refreshUser()
    toast.success('Photo updated!')
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <div className="card">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="relative">
            <div className="w-16 h-16 bg-green-100 rounded-full overflow-hidden flex items-center justify-center">
              {user?.profile_photo ? <img src={`${API_URL}${user.profile_photo}`} alt="" className="w-full h-full object-cover" /> : <User size={28} className="text-green-600" />}
            </div>
            <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-700">
              <Upload size={12} className="text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} />
            </label>
          </div>
          <div>
            <div className="font-bold text-lg">{user?.name}</div>
            <div className="text-sm text-gray-400 capitalize">{user?.role}</div>
            {user?.is_verified && <span className="badge-verified mt-1"><CheckCircle size={10} />Verified</span>}
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Village</label>
              <input className="input-field" value={form.village} onChange={e => setForm(p => ({ ...p, village: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">District</label>
              <input className="input-field" value={form.district} onChange={e => setForm(p => ({ ...p, district: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <input className="input-field" value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <button type="button" onClick={getLocation} className="flex items-center gap-2 text-sm text-green-600 border border-dashed border-green-300 rounded-lg px-4 py-2 hover:bg-green-50">
              <MapPin size={16} />{form.lat ? `${form.lat}, ${form.lng}` : 'Set my location'}
            </button>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>
    </div>
  )
}
