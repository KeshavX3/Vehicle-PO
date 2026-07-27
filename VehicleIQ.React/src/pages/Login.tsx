import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gauge, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authApi, type LoginPayload } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';
import CockpitButton from '../components/cockpit/CockpitButton';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>();

  const onSubmit = async (data: LoginPayload) => {
    setLoading(true);
    try {
      const response = await authApi.login(data);
      login(response);
      toast.success(`Cockpit initialized! Welcome back, ${response.fullName}`);
      navigate('/');
    } catch (err: any) {
      // Handled by Axios interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cockpit-bg relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cockpit-amber/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md cockpit-card p-8 border border-cockpit-border shadow-2xl relative z-10 animate-fade-in">
        {/* Logo Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-cockpit-amber/15 border border-cockpit-amber/30 flex items-center justify-center shadow-lg shadow-cockpit-amber/10 mb-3 text-cockpit-amber">
            <Gauge className="w-8 h-8" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-cockpit-text tracking-tight">VehicleIQ</h1>
            <span className="px-1.5 py-0.5 rounded bg-cockpit-amber/20 border border-cockpit-amber/30 font-mono text-[10px] font-bold text-cockpit-amber">
              HUD v2.0
            </span>
          </div>
          <p className="text-xs text-cockpit-muted font-medium mt-1">Automotive Fleet Telemetry & Cockpit Portal</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-group">
            <label>Email Address</label>
            <div className="relative">
              <input
                type="email"
                {...register('email', { required: 'Email address is required' })}
                placeholder="driver@vehicleiq.com"
                className="w-full pl-10 pr-4 py-2.5 bg-cockpit-surface-2 border border-cockpit-border text-cockpit-text placeholder-cockpit-muted rounded-xl focus:ring-2 focus:ring-cockpit-amber/50"
              />
              <Mail className="w-4 h-4 text-cockpit-muted absolute left-3.5 top-3.5" />
            </div>
            {errors.email && <span className="text-xs text-cockpit-red mt-1 font-mono">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="relative">
              <input
                type="password"
                {...register('password', { required: 'Password is required' })}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-cockpit-surface-2 border border-cockpit-border text-cockpit-text placeholder-cockpit-muted rounded-xl focus:ring-2 focus:ring-cockpit-amber/50"
              />
              <Lock className="w-4 h-4 text-cockpit-muted absolute left-3.5 top-3.5" />
            </div>
            {errors.password && <span className="text-xs text-cockpit-red mt-1 font-mono">{errors.password.message}</span>}
          </div>

          <CockpitButton
            type="submit"
            loading={loading}
            variant="primary"
            size="lg"
            className="w-full mt-2"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            {loading ? 'Initializing Cockpit…' : 'START ENGINE'}
          </CockpitButton>
        </form>

        <div className="mt-6 pt-4 border-t border-cockpit-border/60 flex items-center justify-between text-xs text-cockpit-muted">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit JWT Encryption</span>
          </div>
          <Link to="/register" className="text-cockpit-amber font-semibold hover:underline">
            Register Driver
          </Link>
        </div>
      </div>
    </div>
  );
}
