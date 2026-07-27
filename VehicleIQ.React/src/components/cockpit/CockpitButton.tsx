import React from 'react';

interface CockpitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
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
    primary: 'bg-cockpit-amber hover:bg-amber-500 text-black font-bold border border-amber-400/40 shadow-lg shadow-cockpit-amber/20',
    secondary: 'bg-cockpit-surface-2 hover:bg-cockpit-border text-cockpit-text font-semibold border border-cockpit-border',
    ghost: 'bg-transparent hover:bg-cockpit-surface-2 text-cockpit-muted hover:text-cockpit-text font-medium',
    danger: 'bg-cockpit-red/10 hover:bg-cockpit-red/20 text-cockpit-red font-semibold border border-cockpit-red/30',
  };

  const sizeMap = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
    lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed select-none ${variantMap[variant]} ${sizeMap[size]} ${className}`}
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
