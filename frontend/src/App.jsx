import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import FarmerDashboard from './pages/FarmerDashboard'
import AddProductPage from './pages/AddProductPage'
import EditProductPage from './pages/EditProductPage'
import BuyerDashboard from './pages/BuyerDashboard'
import WishlistPage from './pages/WishlistPage'
import MessagesPage from './pages/MessagesPage'
import ProfilePage from './pages/ProfilePage'
import AdminDashboard from './pages/AdminDashboard'
import MarketPricesPage from './pages/MarketPricesPage'
import EnquiriesPage from './pages/EnquiriesPage'

function PrivateRoute({ children, roles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="market-prices" element={<MarketPricesPage />} />

        <Route path="farmer" element={<PrivateRoute roles={['farmer']}><FarmerDashboard /></PrivateRoute>} />
        <Route path="farmer/products/new" element={<PrivateRoute roles={['farmer']}><AddProductPage /></PrivateRoute>} />
        <Route path="farmer/products/:id/edit" element={<PrivateRoute roles={['farmer']}><EditProductPage /></PrivateRoute>} />
        <Route path="farmer/enquiries" element={<PrivateRoute roles={['farmer']}><EnquiriesPage /></PrivateRoute>} />

        <Route path="buyer" element={<PrivateRoute roles={['buyer']}><BuyerDashboard /></PrivateRoute>} />
        <Route path="wishlist" element={<PrivateRoute roles={['buyer']}><WishlistPage /></PrivateRoute>} />
        <Route path="buyer/enquiries" element={<PrivateRoute roles={['buyer']}><EnquiriesPage /></PrivateRoute>} />

        <Route path="messages" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
        <Route path="profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

        <Route path="admin" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
      </Route>
    </Routes>
  )
}
