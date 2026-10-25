import Link from 'next/link';
export function Logo({ name = 'DEE-LIGHT', dark }: { name?: string; dark?: boolean }) {
  return (
    <Link href="/" aria-label={`${name} home`} className="inline-flex min-w-0 items-center gap-2">
      <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold font-display text-lg font-bold text-brand">D</span>
      <span className={`max-w-[42vw] truncate font-display text-base font-bold tracking-wide sm:max-w-none sm:text-xl ${dark ? 'text-white' : 'text-brand'}`}>{name}</span>
    </Link>
  );
}
