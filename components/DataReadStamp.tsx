export function DataReadStamp({ value }: { value: string }) {
  return (
    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
      Latest data read: {formatTimestamp(value)}
    </p>
  );
}

function formatTimestamp(value: string) {
  return value.replace("T", " ");
}
