import { ReactNode } from 'react';

type StateCardProps = {
  title: string;
  description: string;
  tone?: 'default' | 'warning' | 'success';
  children?: ReactNode;
};

const toneMap = {
  default: 'border-slate-200 bg-slate-50 text-slate-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
};

export function StateCard({
  title,
  description,
  tone = 'default',
  children,
}: StateCardProps) {
  return (
    <div className={`rounded-3xl border p-5 ${toneMap[tone]}`}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6">{description}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
