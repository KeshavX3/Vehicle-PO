import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Vehicles from './pages/Vehicles';
import VehicleDetail from './pages/VehicleDetail';
import FuelLogPage from './pages/FuelLogPage';
import ServiceHistoryPage from './pages/ServiceHistoryPage';
import InsurancePage from './pages/InsurancePage';
import PucPage from './pages/PucPage';
import Expenses from './pages/Expenses';
import Reminders from './pages/Reminders';
import Documents from './pages/Documents';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#0d1530', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/vehicles/:id" element={<VehicleDetail />} />
              <Route path="/fuel" element={<FuelLogPage />} />
              <Route path="/service" element={<ServiceHistoryPage />} />
              <Route path="/insurance" element={<InsurancePage />} />
              <Route path="/puc" element={<PucPage />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/reminders" element={<Reminders />} />
              <Route path="/documents" element={<Documents />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
