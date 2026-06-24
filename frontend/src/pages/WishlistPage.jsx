import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api, { API_URL } from '../utils/api'
import { Heart, Trash2, ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { api.get('/wishlists').then(r => setWishlist(r.data.wishlist)).finally(() => setLoading(false)) }, [])

  const remove = async (productId) => {
    await api.post(`/wishlists/${productId}`)
    setWishlist(prev => prev.filter(w => w.product_id !== productId))
    toast.success('Removed from wishlist')
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" /></div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><Heart size={24} className="text-red-500" />My Wishlist ({wishlist.length})</h1>
      {wishlist.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400">No saved items</p>
          <Link to="/products" className="btn-primary inline-flex mt-4 gap-2 items-center"><ShoppingBag size={16} />Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {wishlist.map(item => (
            <div key={item.id} className="card hover:shadow-md transition-shadow">
              <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                {item.product_images?.[0] ? <img src={`${API_URL}${item.product_images[0]}`} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl">🌾</div>}
              </div>
              <p className="font-medium text-sm">{item.product_name}</p>
              <p className="text-green-600 font-bold text-sm mt-1">₹{item.product_price}</p>
              <div className="flex gap-2 mt-3">
                <Link to={`/products/${item.product_id}`} className="btn-secondary flex-1 text-xs py-1.5 text-center">View</Link>
                <button onClick={() => remove(item.product_id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
