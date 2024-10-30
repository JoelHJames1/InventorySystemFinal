import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import PrivateRoute from './components/PrivateRoute';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetails from './pages/ClientDetails';
import Inventory from './pages/Inventory';
import ProductDetails from './pages/ProductDetails';
import Sales from './pages/Sales';
import NewSale from './pages/NewSale';
import SaleDetails from './pages/SaleDetails';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

function AppComponent() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <div className="flex h-screen bg-gray-100">
                <Sidebar />
                <div className="flex-1 overflow-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/clients/:id" element={<ClientDetails />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/inventory/:id" element={<ProductDetails />} />
                    <Route path="/sales" element={<Sales />} />
                    <Route path="/sales/new" element={<NewSale />} />
                    <Route path="/sales/:id" element={<SaleDetails />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </div>
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default AppComponent;