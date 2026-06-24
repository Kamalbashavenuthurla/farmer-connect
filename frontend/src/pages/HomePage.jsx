import { Link } from 'react-router-dom'
import { ShoppingBag, Users, Shield, TrendingUp, ArrowRight, Leaf, MapPin, MessageCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = [
  { name: 'Vegetables', icon: '🥦' }, { name: 'Fruits', icon: '🍎' },
  { name: 'Grains', icon: '🌾' }, { name: 'Dairy', icon: '🥛' },
  { name: 'Spices', icon: '🌶️' }, { name: 'Organic', icon: '🌿' },
]

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-600 to-green-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-500/30 rounded-full px-4 py-1.5 text-sm mb-6">
            <Leaf size={14} /> Fresh from farm to your table
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Buy Direct from<br /><span className="text-green-200">Local Farmers</span>
          </h1>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">
            No middlemen. No markup. Connect directly with verified farmers in your area for the freshest produce at fair prices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="bg-white text-green-700 font-bold px-8 py-3 rounded-xl hover:bg-green-50 transition-colors flex items-center justify-center gap-2">
              <ShoppingBag size={20} /> Browse Products
            </Link>
            {!user && (
              <Link to="/register" className="border-2 border-white text-white font-bold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                Join as Farmer <ArrowRight size={20} />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b py-10">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-6 text-center">
          {[['500+', 'Verified Farmers'], ['2000+', 'Products Listed'], ['10K+', 'Happy Buyers']].map(([n, l]) => (
            <div key={l}>
              <div className="text-3xl font-bold text-green-600">{n}</div>
              <div className="text-gray-500 text-sm mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map(c => (
            <Link key={c.name} to={`/products?search=${c.name}`}
              className="card hover:shadow-md transition-shadow text-center cursor-pointer hover:border-green-300">
              <div className="text-3xl mb-2">{c.icon}</div>
              <div className="text-sm font-medium text-gray-700">{c.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">Why Choose FarmerConnect?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, color: 'green', title: 'Verified Farmers', desc: 'Every farmer is manually verified for authenticity and quality.' },
              { icon: MapPin, color: 'blue', title: 'Location Based', desc: 'Find farmers near you. Filter by distance for freshest produce.' },
              { icon: MessageCircle, color: 'purple', title: 'Direct Chat', desc: 'Talk directly with farmers. No middlemen, no hidden charges.' },
              { icon: TrendingUp, color: 'orange', title: 'Fair Prices', desc: 'View live market prices and buy at fair, transparent rates.' },
              { icon: Leaf, color: 'emerald', title: 'Organic Options', desc: 'Filter for certified organic produce from trusted farms.' },
              { icon: Users, color: 'rose', title: 'Community', desc: 'Join a growing community of farmers and conscious buyers.' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="card hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center mb-3`}>
                  <Icon size={20} className={`text-${color}-600`} />
                </div>
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="py-16 px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-gray-500 mb-8">Join thousands of farmers and buyers already on FarmerConnect.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register?role=farmer" className="btn-primary px-8 py-3 text-base">Sell as Farmer</Link>
              <Link to="/register?role=buyer" className="btn-secondary px-8 py-3 text-base">Buy as Customer</Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
