import Link from 'next/link';

type SessionActionsProps = {
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export function SessionActions({
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: SessionActionsProps) {
  return (
    <div className="flex flex-col gap-3 pt-2 sm:flex-row">
      <Link
        href={primaryHref}
        className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        {primaryLabel}
      </Link>
      {secondaryLabel && secondaryHref ? (
        <Link
          href={secondaryHref}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
        >
          {secondaryLabel}
        </Link>
      ) : null}
    </div>
  );
}
