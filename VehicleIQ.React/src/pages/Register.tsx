import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Lock, Mail, User as UserIcon, Phone, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authApi, type RegisterPayload } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';

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
      toast.success(`Account created! Welcome, ${response.fullName}!`);
      navigate('/');
    } catch (err: any) {
      // Error handled by Axios interceptor toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-navy-900 relative overflow-hidden">
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-card p-8 border border-white/12 shadow-2xl relative z-10 animate-slide-up">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-3">
            <Car className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Account</h1>
          <p className="text-sm text-slate-400 mt-1">Start tracking your vehicle fleet</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          <div className="form-group">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Full Name</label>
            <div className="relative">
              <input
                type="text"
                {...register('fullName', { required: 'Full name is required' })}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2 bg-navy-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
            {errors.fullName && <span className="text-xs text-red-400 mt-1">{errors.fullName.message}</span>}
          </div>

          <div className="form-group">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</label>
            <div className="relative">
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2 bg-navy-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
            {errors.email && <span className="text-xs text-red-400 mt-1">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Phone (Optional)</label>
            <div className="relative">
              <input
                type="tel"
                {...register('phone')}
                placeholder="+91 9876543210"
                className="w-full pl-10 pr-4 py-2 bg-navy-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <div className="form-group">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
            <div className="relative">
              <input
                type="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                })}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 bg-navy-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
            {errors.password && <span className="text-xs text-red-400 mt-1">{errors.password.message}</span>}
          </div>

          <div className="form-group">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Confirm Password</label>
            <div className="relative">
              <input
                type="password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (val) => val === password || 'Passwords do not match',
                })}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 bg-navy-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
            {errors.confirmPassword && (
              <span className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-2.5 text-base font-semibold mt-2 shadow-lg shadow-blue-500/25"
          >
            {loading ? 'Creating Account…' : 'Register'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-accent font-medium hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
