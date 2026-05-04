import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Products from './pages/Products'
import About from './pages/About'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import CheckoutSuccess from './pages/CheckoutSuccess'
import CheckoutCancel from './pages/CheckoutCancel'
import Contact from './pages/Contact'
import ProductDetail from './pages/ProductDetail'
import AdminLogin from './pages/admin/Login'
import AdminShell from './pages/admin/AdminShell'
import AdminProducts from './pages/admin/Products'
import AdminNewProduct from './pages/admin/NewProduct'
import AdminEditProduct from './pages/admin/EditProduct'
import AdminSales from './pages/admin/Sales'
import AdminPromotions from './pages/admin/Promotions'
import AdminOrders from './pages/admin/Orders'
import AdminAccounting from './pages/admin/Accounting'
import AdminTestimonials from './pages/admin/Testimonials'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import CartDrawer from './components/CartDrawer'

function AdminLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <CartDrawer />
        <Routes>
          {/* Public site */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/checkout/cancel" element={<CheckoutCancel />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* Admin portal */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="login" element={<AdminLogin />} />
            <Route element={<AdminShell />}>
              <Route index element={<Navigate to="/admin/orders" replace />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<AdminNewProduct />} />
              <Route path="products/:id/edit" element={<AdminEditProduct />} />
              <Route path="sales" element={<AdminSales />} />
              <Route path="promotions" element={<AdminPromotions />} />
              <Route path="accounting" element={<AdminAccounting />} />
              <Route path="testimonials" element={<AdminTestimonials />} />
            </Route>
          </Route>
        </Routes>
      </CartProvider>
    </BrowserRouter>
  )
}
