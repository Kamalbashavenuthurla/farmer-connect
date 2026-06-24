import { useState, useEffect } from 'react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { MessageCircle, Clock, CheckCircle, Phone } from 'lucide-react'

const statusColors = { pending: 'bg-yellow-100 text-yellow-700', responded: 'bg-green-100 text-green-700', closed: 'bg-gray-100 text-gray-500' }

export default function EnquiriesPage() {
  const { user } = useAuth()
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { api.get('/enquiries/my').then(r => setEnquiries(r.data.enquiries)).finally(() => setLoading(false)) }, [])

  const updateStatus = async (id, status) => {
    await api.put(`/enquiries/${id}/status?status=${status}`)
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status } : e))
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" /></div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><MessageCircle size={24} />
        {user.role === 'farmer' ? 'Received Enquiries' : 'My Enquiries'} ({enquiries.length})
      </h1>

      {enquiries.length === 0 ? (
        <div className="text-center py-20 text-gray-400"><MessageCircle size={48} className="mx-auto mb-3 text-gray-200" /><p>No enquiries yet</p></div>
      ) : (
        <div className="space-y-4">
          {enquiries.map(e => (
            <div key={e.id} className="card">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="font-semibold">{e.buyer?.name}</div>
                  <div className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock size={12} />{new Date(e.created_at).toLocaleDateString()}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[e.status]}`}>{e.status}</span>
              </div>
              <p className="text-sm text-gray-700 mb-3">{e.message}</p>
              {e.quantity && <p className="text-xs text-gray-400">Quantity requested: {e.quantity}</p>}
              {user.role === 'farmer' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                  {e.buyer?.phone && (
                    <a href={`tel:${e.buyer.phone}`} className="btn-secondary text-sm flex items-center gap-1.5 py-1.5">
                      <Phone size={14} />Call Buyer
                    </a>
                  )}
                  {e.status === 'pending' && (
                    <button onClick={() => updateStatus(e.id, 'responded')} className="btn-primary text-sm flex items-center gap-1.5 py-1.5">
                      <CheckCircle size={14} />Mark Responded
                    </button>
                  )}
                  {e.status !== 'closed' && (
                    <button onClick={() => updateStatus(e.id, 'closed')} className="text-sm text-gray-400 hover:text-gray-600 px-3 py-1.5">Close</button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
