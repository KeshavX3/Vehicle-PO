import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = false }: Props) {
  return (
    <div className={`cockpit-card p-5 ${hover ? 'hover:border-cockpit-amber/40 hover:shadow-xl transition-all duration-200 cursor-pointer' : ''} ${className}`}>
      {children}
    </div>
  );
}
