import React from 'react';

interface GaugeRingProps {
  value: number;
  max?: number;
  label?: string;
  unit?: string;
  color?: 'green' | 'amber' | 'red' | 'blue' | 'custom';
  customColor?: string;
  size?: 'sm' | 'md' | 'lg';
  subtext?: string;
}

export default function GaugeRing({
  value,
  max = 100,
  label,
  unit,
  color = 'amber',
  customColor,
  size = 'md',
  subtext,
}: GaugeRingProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const strokeColorMap = {
    green: '#22C55E',
    amber: '#F59E0B',
    red: '#EF4444',
    blue: '#3B82F6',
    custom: customColor || '#F59E0B',
  };

  const selectedColor = strokeColorMap[color];

  const sizeMap = {
    sm: { radius: 36, stroke: 6, width: 88, text: 'text-base', label: 'text-[10px]' },
    md: { radius: 52, stroke: 8, width: 128, text: 'text-2xl', label: 'text-xs' },
    lg: { radius: 70, stroke: 10, width: 168, text: 'text-3xl', label: 'text-sm' },
  };

  const config = sizeMap[size];
  const circumference = 2 * Math.PI * config.radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className="flex flex-col items-center justify-center text-center p-2"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label || subtext || 'Gauge measurement'}
    >
      <div className="relative flex items-center justify-center" style={{ width: config.width, height: config.width }}>
        <svg width={config.width} height={config.width} className="transform -rotate-90">
          {/* Background Ring */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={config.radius}
            stroke="#2A2A2E"
            strokeWidth={config.stroke}
            fill="transparent"
          />
          {/* Progress Ring */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={config.radius}
            stroke={selectedColor}
            strokeWidth={config.stroke}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Inner Value Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-mono font-bold ${config.text} text-cockpit-text leading-none`}>
            {typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(1) : value}
            {unit && <span className="text-[10px] text-cockpit-muted font-normal ml-0.5">{unit}</span>}
          </span>
          {subtext && <span className="text-[10px] text-cockpit-muted font-medium mt-1">{subtext}</span>}
        </div>
      </div>

      {label && <span className={`font-semibold uppercase tracking-wider text-cockpit-muted mt-2 ${config.label}`}>{label}</span>}
    </div>
  );
}
