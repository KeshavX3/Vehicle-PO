import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = false }: Props) {
  return (
    <div className={`glass-card p-5 ${hover ? 'hover:border-white/15 hover:bg-white/6 transition-all duration-300 cursor-pointer' : ''} ${className}`}>
      {children}
    </div>
  );
}
