import React from 'react';

interface CockpitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'amber' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
}

export default function CockpitButton({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  className = '',
  disabled,
  ...props
}: CockpitButtonProps) {
  const variantMap = {
    primary: 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold border border-blue-400/30 shadow-lg shadow-blue-500/25',
    amber: 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold border border-amber-300/40 shadow-lg shadow-amber-500/20',
    secondary: 'bg-cockpit-surface-2 hover:bg-cockpit-surface-3 text-white font-semibold border border-white/10 hover:border-white/20',
    ghost: 'bg-transparent hover:bg-white/10 text-slate-300 hover:text-white font-medium',
    danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold border border-red-500/30',
  };

  const sizeMap = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
    lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed select-none ${variantMap[variant]} ${sizeMap[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon
      )}
      <span>{children}</span>
    </button>
  );
}
