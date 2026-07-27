import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gauge, Lock, Mail, User as UserIcon, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authApi, type RegisterPayload } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';
import CockpitButton from '../components/cockpit/CockpitButton';

interface RegisterFormFields extends RegisterPayload {
  confirmPassword?: string;
}

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormFields>();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormFields) => {
    setLoading(true);
    try {
      const response = await authApi.register({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
      });
      login(response);
      toast.success(`Account created! Welcome to VehicleIQ, ${response.fullName}`);
      navigate('/');
    } catch (err: any) {
      // Handled by Axios interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cockpit-bg relative overflow-hidden">
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cockpit-amber/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md cockpit-card p-8 border border-cockpit-border shadow-2xl relative z-10 animate-fade-in">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-cockpit-amber/15 border border-cockpit-amber/30 flex items-center justify-center shadow-lg shadow-cockpit-amber/10 mb-3 text-cockpit-amber">
            <Gauge className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-cockpit-text tracking-tight">Register Driver Account</h1>
          <p className="text-xs text-cockpit-muted font-medium mt-1">Start tracking your digital twin vehicle fleet</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          <div className="form-group">
            <label>Full Name</label>
            <div className="relative">
              <input
                type="text"
                {...register('fullName', { required: 'Full name is required' })}
                placeholder="Keshav Kumar"
                className="w-full pl-10 pr-4 py-2 bg-cockpit-surface-2 border border-cockpit-border text-cockpit-text placeholder-cockpit-muted rounded-xl"
              />
              <UserIcon className="w-4 h-4 text-cockpit-muted absolute left-3.5 top-3" />
            </div>
            {errors.fullName && <span className="text-xs text-cockpit-red font-mono mt-1">{errors.fullName.message}</span>}
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div className="relative">
              <input
                type="email"
                {...register('email', { required: 'Email address is required' })}
                placeholder="driver@vehicleiq.com"
                className="w-full pl-10 pr-4 py-2 bg-cockpit-surface-2 border border-cockpit-border text-cockpit-text placeholder-cockpit-muted rounded-xl"
              />
              <Mail className="w-4 h-4 text-cockpit-muted absolute left-3.5 top-3" />
            </div>
            {errors.email && <span className="text-xs text-cockpit-red font-mono mt-1">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label>Phone Number (Optional)</label>
            <div className="relative">
              <input
                type="tel"
                {...register('phone')}
                placeholder="+91 9876543210"
                className="w-full pl-10 pr-4 py-2 bg-cockpit-surface-2 border border-cockpit-border text-cockpit-text placeholder-cockpit-muted rounded-xl"
              />
              <Phone className="w-4 h-4 text-cockpit-muted absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="relative">
              <input
                type="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Must be at least 6 characters' },
                })}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 bg-cockpit-surface-2 border border-cockpit-border text-cockpit-text placeholder-cockpit-muted rounded-xl"
              />
              <Lock className="w-4 h-4 text-cockpit-muted absolute left-3.5 top-3" />
            </div>
            {errors.password && <span className="text-xs text-cockpit-red font-mono mt-1">{errors.password.message}</span>}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <div className="relative">
              <input
                type="password"
                {...register('confirmPassword', {
                  required: 'Please confirm password',
                  validate: (val) => val === password || 'Passwords do not match',
                })}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 bg-cockpit-surface-2 border border-cockpit-border text-cockpit-text placeholder-cockpit-muted rounded-xl"
              />
              <Lock className="w-4 h-4 text-cockpit-muted absolute left-3.5 top-3" />
            </div>
            {errors.confirmPassword && (
              <span className="text-xs text-cockpit-red font-mono mt-1">{errors.confirmPassword.message}</span>
            )}
          </div>

          <CockpitButton
            type="submit"
            loading={loading}
            variant="primary"
            size="lg"
            className="w-full mt-2"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            {loading ? 'Creating Account…' : 'CREATE DRIVER PROFILE'}
          </CockpitButton>
        </form>

        <div className="mt-5 pt-4 border-t border-cockpit-border/60 flex items-center justify-between text-xs text-cockpit-muted">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure Registration</span>
          </div>
          <Link to="/login" className="text-cockpit-amber font-semibold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
