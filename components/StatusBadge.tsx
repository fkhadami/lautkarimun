const styles: Record<string, string> = {
  safe: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${styles[status] || styles.safe}`}>
      {status}
    </span>
  );
}
