import React, { Suspense } from 'react'; // <--- FIXED: Must be at the top
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Loader from './components/common/Loader';
import { useAppSelector } from './store/hooks';
import AdminProducts from './pages/admin/AdminProducts';
import ProductForm from './pages/admin/ProductForm';

// Lazy Load Pages
const Home = React.lazy(() => import('./pages/Home'));
const Category = React.lazy(() => import('./pages/Category'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const OrderSuccess = React.lazy(() => import('./pages/OrderSuccess'));
const UserProfile = React.lazy(() => import('./pages/UserProfile'));
const AdminLayout = React.lazy(() => import('./components/layout/AdminLayout'));
const Dashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const AdminOrders = React.lazy(() => import('./pages/admin/AdminOrders'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes tak data purana nahi manega (Refetch nahi karega)
      gcTime: 1000 * 60 * 10,   // 10 minutes tak cache me rakhega
      retry: 1,                 // Fail hone par sirf 1 baar retry karega (Fast fail)
      refetchOnWindowFocus: false, // Window tab change karne par refetch band
    },
  },
});

// Protected Route Component (User)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAppSelector((state) => state.auth);
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Admin Route Component (Admin Only)
const AdminRoute = () => {
  const { user } = useAppSelector((state) => state.auth);
  return (user && user.role === 'admin') ? <Outlet /> : <Navigate to="/login" />;
};

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="flex flex-col min-h-screen bg-primary font-sans">
            <Navbar />
            <main className="grow">
              <Suspense fallback={<Loader />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Category />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* Protected User Routes */}
                  <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                  <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
                  <Route path="/account" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

                  {/* Admin Routes */}
                  <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<Dashboard />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="products" element={<AdminProducts />} /> {/* New */}
                      <Route path="products/new" element={<ProductForm />} /> {/* New */}
                      <Route path="products/edit/:id" element={<ProductForm />} /> {/* New */}
                    </Route>
                  </Route>

                  {/* 404 Route */}
                  <Route path="*" element={<div className="p-20 text-center text-dark">404 - Page Not Found</div>} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </Router>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;