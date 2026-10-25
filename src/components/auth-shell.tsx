export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return <div className="mx-auto max-w-md px-4 py-12"><div className="rounded-lg border border-line bg-white p-6 shadow-card sm:p-8"><h1 className="text-3xl font-semibold text-brand">{title}</h1>{subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}<div className="mt-6">{children}</div></div></div>;
}
