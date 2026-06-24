import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import { ShoppingBag, MessageCircle, Heart, LayoutDashboard, LogOut, Menu, X, Sprout, TrendingUp, User } from 'lucide-react'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }

  const navLink = (to, label, Icon) => (
    <Link to={to} onClick={() => setMenuOpen(false)}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === to ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:text-green-700 hover:bg-green-50'}`}>
      {Icon && <Icon size={16} />}{label}
    </Link>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Sprout size={18} className="text-white" />
              </div>
              <span className="font-bold text-gray-900 text-lg">FarmerConnect</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLink('/products', 'Browse', ShoppingBag)}
              {navLink('/market-prices', 'Market Prices', TrendingUp)}
              {user?.role === 'farmer' && navLink('/farmer', 'Dashboard', LayoutDashboard)}
              {user?.role === 'buyer' && navLink('/buyer', 'Dashboard', LayoutDashboard)}
              {user?.role === 'admin' && navLink('/admin', 'Admin', LayoutDashboard)}
              {user && navLink('/messages', 'Messages', MessageCircle)}
              {user?.role === 'buyer' && navLink('/wishlist', 'Wishlist', Heart)}
              {user ? (
                <div className="flex items-center gap-2 ml-2">
                  {navLink('/profile', user.name.split(' ')[0], User)}
                  <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                    <LogOut size={16} />Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 ml-2">
                  <Link to="/login" className="btn-secondary text-sm py-1.5">Login</Link>
                  <Link to="/register" className="btn-primary text-sm py-1.5">Register</Link>
                </div>
              )}
            </div>

            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1">
            {navLink('/products', 'Browse Products', ShoppingBag)}
            {navLink('/market-prices', 'Market Prices', TrendingUp)}
            {user?.role === 'farmer' && navLink('/farmer', 'Farmer Dashboard', LayoutDashboard)}
            {user?.role === 'buyer' && navLink('/buyer', 'Buyer Dashboard', LayoutDashboard)}
            {user?.role === 'admin' && navLink('/admin', 'Admin', LayoutDashboard)}
            {user && navLink('/messages', 'Messages', MessageCircle)}
            {user?.role === 'buyer' && navLink('/wishlist', 'Wishlist', Heart)}
            {user ? (
              <>
                {navLink('/profile', 'Profile', User)}
                <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600">
                  <LogOut size={16} />Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary flex-1 text-center text-sm">Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary flex-1 text-center text-sm">Register</Link>
              </div>
            )}
          </div>
        )}
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-gray-800 text-gray-300 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
              <Sprout size={14} className="text-white" />
            </div>
            <span className="font-bold text-white">FarmerConnect</span>
          </div>
          <p className="text-sm">Connecting farmers directly with buyers. Fresh from farm to your table.</p>
          <p className="text-xs mt-2 text-gray-500">© 2024 FarmerConnect Marketplace</p>
        </div>
      </footer>
    </div>
  )
}
