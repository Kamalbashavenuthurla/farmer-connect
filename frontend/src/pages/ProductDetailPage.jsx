import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api, { API_URL } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { MapPin, Phone, MessageCircle, Heart, CheckCircle, Leaf, Calendar, Package, User, Send } from 'lucide-react'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [enquiry, setEnquiry] = useState('')
  const [enquiryQty, setEnquiryQty] = useState('')
  const [sending, setSending] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)

  useEffect(() => {
    api.get(`/products/${id}`).then(r => { setProduct(r.data); setLoading(false) }).catch(() => navigate('/products'))
  }, [id])

  const sendEnquiry = async () => {
    if (!user) { toast.error('Please login first'); navigate('/login'); return }
    if (!enquiry.trim()) { toast.error('Enter a message'); return }
    setSending(true)
    try {
      await api.post('/enquiries/', { farmer_id: product.farmer_id, product_id: product.id, message: enquiry, quantity: enquiryQty ? parseFloat(enquiryQty) : null })
      toast.success('Enquiry sent to farmer!')
      setEnquiry('')
      setEnquiryQty('')
    } catch { toast.error('Failed to send') }
    finally { setSending(false) }
  }

  const openChat = async () => {
    if (!user) { navigate('/login'); return }
    await api.post('/messages/', { receiver_id: product.farmer_id, content: `Hi, I'm interested in your ${product.name}`, product_id: product.id })
    navigate('/messages')
  }

  const toggleWishlist = async () => {
    if (!user) { navigate('/login'); return }
    const res = await api.post(`/wishlists/${product.id}`)
    setWishlisted(res.data.wishlisted)
    toast.success(res.data.wishlisted ? 'Added to wishlist' : 'Removed from wishlist')
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" /></div>
  if (!product) return null

  const images = product.images?.length ? product.images : []

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-3">
            {images[activeImg] ? (
              <img src={`${API_URL}${images[activeImg]}`} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">🌾</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${i === activeImg ? 'border-green-500' : 'border-transparent'}`}>
                  <img src={`${API_URL}${img}`} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex gap-2 mb-2">
            {product.is_organic && <span className="badge-organic"><Leaf size={12} />Organic</span>}
            {product.farmer?.is_verified && <span className="badge-verified"><CheckCircle size={12} />Verified Farmer</span>}
          </div>
          <h1 className="text-2xl font-bold mb-1">{product.name}</h1>
          <p className="text-gray-500 text-sm mb-3">{product.category_name}</p>

          <div className="text-3xl font-bold text-green-600 mb-4">
            ₹{product.price} <span className="text-base font-normal text-gray-400">{product.price_unit}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              ['Available Qty', `${product.quantity} ${product.quantity_unit}`],
              ['Harvest Date', product.harvest_date || 'Fresh'],
              ['Views', product.views],
            ].map(([label, value]) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-400">{label}</div>
                <div className="font-semibold text-sm mt-0.5">{value}</div>
              </div>
            ))}
          </div>

          {product.description && <p className="text-gray-600 text-sm mb-4">{product.description}</p>}

          {/* Farmer info */}
          {product.farmer && (
            <div className="border border-gray-100 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <User size={20} className="text-green-600" />
                </div>
                <div>
                  <div className="font-semibold">{product.farmer.name}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <MapPin size={10} />{[product.farmer.village, product.farmer.district].filter(Boolean).join(', ')}
                  </div>
                </div>
                {product.farmer.is_verified && <span className="badge-verified ml-auto"><CheckCircle size={10} />Verified</span>}
              </div>
              <div className="flex gap-2">
                <a href={`tel:${product.farmer.phone}`} className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm py-2">
                  <Phone size={16} />Call
                </a>
                {user && user.id !== product.farmer_id && (
                  <button onClick={openChat} className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-2">
                    <MessageCircle size={16} />Chat
                  </button>
                )}
                {user?.role === 'buyer' && (
                  <button onClick={toggleWishlist} className={`p-2 rounded-lg border ${wishlisted ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 text-gray-400'}`}>
                    <Heart size={18} className={wishlisted ? 'fill-current' : ''} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Enquiry */}
          {user && user.id !== product.farmer_id && (
            <div className="border border-green-100 rounded-xl p-4 bg-green-50">
              <h3 className="font-semibold mb-3">Send Enquiry</h3>
              <textarea className="input-field mb-2 text-sm resize-none" rows={3} placeholder="Ask about this product..." value={enquiry} onChange={e => setEnquiry(e.target.value)} />
              <div className="flex gap-2">
                <input className="input-field text-sm" type="number" placeholder="Quantity (optional)" value={enquiryQty} onChange={e => setEnquiryQty(e.target.value)} />
                <button onClick={sendEnquiry} disabled={sending} className="btn-primary flex items-center gap-2 whitespace-nowrap">
                  <Send size={16} />{sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
