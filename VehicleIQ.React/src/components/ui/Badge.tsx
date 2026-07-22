type Variant = 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'slate';

const styles: Record<Variant, string> = {
  blue:   'bg-blue-500/15 text-blue-300 border-blue-500/25',
  green:  'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  amber:  'bg-amber-500/15 text-amber-300 border-amber-500/25',
  red:    'bg-red-500/15 text-red-300 border-red-500/25',
  purple: 'bg-purple-500/15 text-purple-300 border-purple-500/25',
  slate:  'bg-slate-500/15 text-slate-300 border-slate-500/25',
};

interface Props {
  label: string;
  variant?: Variant;
  dot?: boolean;
}

export default function Badge({ label, variant = 'slate', dot = false }: Props) {
  return (
    <span className={`badge border ${styles[variant]}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full bg-current`} />}
      {label}
    </span>
  );
}
