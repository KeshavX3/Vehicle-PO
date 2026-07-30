import React from 'react';
import type { VehicleDto } from '../../types';
import RegistrationPlate from './RegistrationPlate';
import HealthScoreBadge from './HealthScoreBadge';
import StatusDot from './StatusDot';
import { Gauge, Fuel, Calendar, Wrench, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface VehicleHeroProps {
  vehicle: VehicleDto;
  healthScore?: number;
  baselineMileage?: number;
}

export default function VehicleHero({ vehicle, healthScore = 95, baselineMileage = 14.5 }: VehicleHeroProps) {
  const defaultImages: Record<number, string> = {
    0: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?q=80&w=1200&auto=format&fit=crop', // Car
    1: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1200&auto=format&fit=crop', // SUV
    2: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1200&auto=format&fit=crop', // Bike
    3: 'https://images.unsplash.com/photo-1596706016847-97d8b5c907cf?q=80&w=1200&auto=format&fit=crop', // Scooter
    4: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=1200&auto=format&fit=crop', // Truck
  };

  const imageSrc = vehicle.photoUrl || defaultImages[vehicle.vehicleType] || defaultImages[0];

  return (
    <div className="cockpit-card overflow-hidden group border-blue-500/30">
      {/* Background Image Container with Gradient Overlay */}
      <div className="relative h-64 md:h-72 w-full overflow-hidden bg-cockpit-bg-soft">
        <img
          src={imageSrc}
          alt={`${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-65"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultImages[0];
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#161F33] via-[#161F33]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#161F33]/95 via-transparent to-[#161F33]/50" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <RegistrationPlate registrationNumber={vehicle.registrationNumber} size="md" />
            <StatusDot status="healthy" label="CONNECTED" />
          </div>
          <HealthScoreBadge score={healthScore} size="md" />
        </div>

        {/* Vehicle Main Details Overlay */}
        <div className="absolute bottom-4 left-5 right-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
              <span>{vehicle.year} Model</span>
              <span>•</span>
              <span>{vehicle.color || 'Custom'}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight group-hover:text-blue-400 transition-colors">
              {vehicle.make} {vehicle.model}
            </h2>
          </div>

          <Link
            to={`/vehicles/${vehicle.id}`}
            className="btn-cockpit-primary !py-2 !px-4 text-xs self-start md:self-auto"
          >
            Digital Twin Telemetry
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Telemetry Gauge Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-cockpit-bg-soft/90 border-t border-white/10">
        <div className="flex items-center gap-3">
          <Gauge className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Current Odometer</span>
            <span className="font-mono font-bold text-base text-white">{vehicle.currentOdometer.toLocaleString()} km</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Fuel className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Baseline Economy</span>
            <span className="font-mono font-bold text-base text-white">{baselineMileage} km/L</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Make & Year</span>
            <span className="font-mono font-bold text-base text-white">{vehicle.make} '{vehicle.year.toString().slice(2)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Wrench className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">System Status</span>
            <span className="font-mono font-bold text-base text-emerald-400">Optimal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
