import { Bell, ChevronRight } from 'lucide-react';

interface Props {
  title: string;
  subtitle?: string;
  breadcrumbs?: string[];
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, breadcrumbs, actions }: Props) {
  return (
    <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between shrink-0">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mb-0.5">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight size={10} />}
                <span className={i === breadcrumbs.length - 1 ? 'text-stone-500 font-medium' : ''}>
                  {b}
                </span>
              </span>
            ))}
          </div>
        )}
        <h1 className="text-xl font-semibold text-stone-800 leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-stone-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {actions}
        <button className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors relative">
          <Bell size={19} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
}
