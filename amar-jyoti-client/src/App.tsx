import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Category from './pages/Category';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/CheckOut';
import OrderSuccess from './pages/OrderSuccess';

// Initialize React Query Client
const queryClient = new QueryClient();

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="flex flex-col min-h-screen bg-primary">
            <Navbar />
            <main className="grow">
              <Routes>
                {/* Routes will be added here in next steps */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Category />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-success" element={<OrderSuccess />}/>
                <Route path="*" element={<div className="p-20 text-center">404 - Page Not Found</div>} />
              </Routes>
            </main>
            {/* Footer will go here */}
            <footer className="py-8 text-center text-subtle-text text-sm">© 2025 Amar Jyoti</footer>
          </div>
        </Router>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;