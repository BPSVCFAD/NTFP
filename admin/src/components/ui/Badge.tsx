type BadgeVariant = 'green' | 'amber' | 'red' | 'blue' | 'stone' | 'purple' | 'violet';

const variants: Record<BadgeVariant, string> = {
  green:  'bg-emerald-100 text-emerald-800',
  amber:  'bg-amber-100 text-amber-800',
  red:    'bg-red-100 text-red-800',
  blue:   'bg-blue-100 text-blue-800',
  stone:  'bg-stone-100 text-stone-700',
  purple: 'bg-purple-100 text-purple-800',
  violet: 'bg-violet-100 text-violet-800',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export default function Badge({ children, variant = 'stone', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
