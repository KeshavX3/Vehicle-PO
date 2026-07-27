export interface VehicleHealthInputs {
  hasOverdueReminder?: boolean;
  insuranceDaysLeft?: number | null;
  pucDaysLeft?: number | null;
  serviceUrgency?: string | null;
  hasFuelAnomaly?: boolean;
}

export function calculateHealthScore(inputs: VehicleHealthInputs): number {
  let score = 100;

  if (inputs.hasOverdueReminder) {
    score -= 25;
  }

  if (inputs.insuranceDaysLeft !== undefined && inputs.insuranceDaysLeft !== null) {
    if (inputs.insuranceDaysLeft <= 7) {
      score -= 20;
    }
  }

  if (inputs.pucDaysLeft !== undefined && inputs.pucDaysLeft !== null) {
    if (inputs.pucDaysLeft <= 7) {
      score -= 15;
    }
  }

  if (inputs.serviceUrgency === 'Overdue') {
    score -= 20;
  } else if (inputs.serviceUrgency === 'Urgent') {
    score -= 10;
  }

  if (inputs.hasFuelAnomaly) {
    score -= 15;
  }

  return Math.max(0, score);
}

export function getHealthColor(score: number): { text: string; bg: string; border: string; hex: string } {
  if (score >= 80) {
    return {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      hex: '#22C55E',
    };
  }
  if (score >= 50) {
    return {
      text: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      hex: '#F59E0B',
    };
  }
  return {
    text: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    hex: '#EF4444',
  };
}
