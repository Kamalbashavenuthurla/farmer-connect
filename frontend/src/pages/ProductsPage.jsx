import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api, { API_URL } from '../utils/api'
import { Search, MapPin, Filter, Heart, Leaf, CheckCircle, Package } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function ProductsPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [wishlist, setWishlist] = useState(new Set())
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category_id: '',
    is_organic: '',
    radius_km: '',
    min_price: '',
    max_price: '',
  })
  const [userLocation, setUserLocation] = useState(null)

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data))
    if (user?.role === 'buyer') {
      api.get('/wishlists').then(r => {
        setWishlist(new Set(r.data.wishlist.map(w => w.product_id)))
      }).catch(() => {})
    }
  }, [user])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
      if (userLocation && filters.radius_km) {
        params.set('lat', userLocation.lat)
        params.set('lng', userLocation.lng)
      }
      const res = await api.get(`/products/?${params}`)
      setProducts(res.data.products)
    } catch { toast.error('Failed to load products') }
    finally { setLoading(false) }
  }, [filters, userLocation])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const getLocation = () => {
    navigator.geolocation?.getCurrentPosition(pos => {
      setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      toast.success('Location found! Showing nearby products.')
    })
  }

  const toggleWishlist = async (e, productId) => {
    e.preventDefault()
    if (!user) { toast.error('Login to save wishlist'); return }
    try {
      const res = await api.post(`/wishlists/${productId}`)
      setWishlist(prev => { const n = new Set(prev); res.data.wishlisted ? n.add(productId) : n.delete(productId); return n })
    } catch { toast.error('Failed') }
  }

  const imgSrc = (images) => images?.[0] ? `${API_URL}${images[0]}` : null

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          <input className="input-field pl-10" placeholder="Search products..."
            value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))} />
        </div>
        <select className="input-field md:w-48" value={filters.category_id} onChange={e => setFilters(p => ({ ...p, category_id: e.target.value }))}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        <select className="input-field md:w-40" value={filters.radius_km} onChange={e => { setFilters(p => ({ ...p, radius_km: e.target.value })); if (e.target.value && !userLocation) getLocation() }}>
          <option value="">Any Distance</option>
          <option value="5">Within 5 km</option>
          <option value="10">Within 10 km</option>
          <option value="25">Within 25 km</option>
          <option value="50">Within 50 km</option>
        </select>
        <label className="flex items-center gap-2 whitespace-nowrap cursor-pointer">
          <input type="checkbox" className="rounded text-green-600" checked={filters.is_organic === 'true'} onChange={e => setFilters(p => ({ ...p, is_organic: e.target.checked ? 'true' : '' }))} />
          <span className="text-sm font-medium">Organic only</span>
        </label>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="card h-64 animate-pulse bg-gray-100" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <Package size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No products found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => (
            <Link key={p.id} to={`/products/${p.id}`} className="card hover:shadow-md transition-shadow group relative overflow-hidden">
              <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                {imgSrc(p.images) ? (
                  <img src={imgSrc(p.images)} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    {categories.find(c => c.id === p.category_id)?.icon || '🌾'}
                  </div>
                )}
              </div>
              {user?.role === 'buyer' && (
                <button onClick={(e) => toggleWishlist(e, p.id)} className="absolute top-6 right-6 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:scale-110 transition-transform">
                  <Heart size={16} className={wishlist.has(p.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
                </button>
              )}
              <div className="flex gap-1 flex-wrap mb-1">
                {p.is_organic && <span className="badge-organic"><Leaf size={10} />Organic</span>}
                {p.farmer?.is_verified && <span className="badge-verified"><CheckCircle size={10} />Verified</span>}
              </div>
              <h3 className="font-semibold text-sm text-gray-800 leading-tight">{p.name}</h3>
              <p className="text-green-600 font-bold text-base mt-1">₹{p.price} <span className="text-xs font-normal text-gray-400">{p.price_unit}</span></p>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <MapPin size={10} />{p.farmer?.village || p.farmer?.district || 'N/A'}
                {p.distance_km && <span className="ml-auto text-green-600 font-medium">{p.distance_km} km</span>}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
