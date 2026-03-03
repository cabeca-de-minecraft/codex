export function StateMessage({ title, description }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/60 p-6 text-center">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

