export default function Page() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-xl rounded-2xl border bg-card px-8 py-10 text-center shadow-sm">
        <div className="inline-flex items-center rounded-full border bg-muted px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Under Construction
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-tight">This page is under construction</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          We’re actively preparing the admin dashboard. Please check back soon for the full experience.
        </p>
      </div>
    </div>
  );
}
