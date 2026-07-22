import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import VehicleDetail from './pages/VehicleDetail';
import Expenses from './pages/Expenses';
import Reminders from './pages/Reminders';
import Documents from './pages/Documents';

const ComingSoon = ({ name }: { name: string }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <p className="text-4xl mb-3">🚧</p>
      <h3 className="text-lg font-semibold text-white">{name}</h3>
      <p className="text-slate-400 text-sm mt-1">Access this from a Vehicle's detail page.</p>
    </div>
  </div>
);

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
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/vehicles/:id" element={<VehicleDetail />} />
              <Route path="/fuel" element={<ComingSoon name="Fuel Log" />} />
              <Route path="/service" element={<ComingSoon name="Service History" />} />
              <Route path="/insurance" element={<ComingSoon name="Insurance" />} />
              <Route path="/puc" element={<ComingSoon name="PUC Certificates" />} />
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
