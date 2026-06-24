import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { ShoppingBag, Heart, MessageCircle, TrendingUp } from 'lucide-react'

export default function BuyerDashboard() {
  const { user } = useAuth()
  const [wishlistCount, setWishlistCount] = useState(0)
  const [enquiryCount, setEnquiryCount] = useState(0)

  useEffect(() => {
    api.get('/wishlists').then(r => setWishlistCount(r.data.wishlist.length)).catch(() => {})
    api.get('/enquiries/my').then(r => setEnquiryCount(r.data.enquiries.length)).catch(() => {})
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Welcome, {user.name} 🛒</h1>
      <p className="text-gray-500 mb-8">Find fresh produce directly from farmers near you</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Saved Items', value: wishlistCount, icon: Heart, color: 'red', link: '/wishlist' },
          { label: 'My Enquiries', value: enquiryCount, icon: MessageCircle, color: 'blue', link: '/buyer/enquiries' },
        ].map(({ label, value, icon: Icon, color, link }) => (
          <Link key={label} to={link} className="card hover:shadow-md transition-shadow">
            <div className={`w-8 h-8 bg-${color}-100 rounded-lg flex items-center justify-center mb-2`}>
              <Icon size={16} className={`text-${color}-600`} />
            </div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-gray-400">{label}</div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Link to="/products" className="card hover:shadow-md transition-shadow flex items-center gap-4 group">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
            <ShoppingBag size={24} className="text-green-600" />
          </div>
          <div>
            <div className="font-semibold">Browse Products</div>
            <div className="text-sm text-gray-400">Find fresh produce nearby</div>
          </div>
        </Link>
        <Link to="/market-prices" className="card hover:shadow-md transition-shadow flex items-center gap-4 group">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
            <TrendingUp size={24} className="text-blue-600" />
          </div>
          <div>
            <div className="font-semibold">Market Prices</div>
            <div className="text-sm text-gray-400">Today's commodity prices</div>
          </div>
        </Link>
      </div>
    </div>
  )
}
