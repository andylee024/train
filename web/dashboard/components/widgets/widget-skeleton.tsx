/**
 * Loading placeholder for Widget. Renders muted bars at bg-elev-2 to indicate
 * pending data without taking over the layout.
 */
export function WidgetSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2 py-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-[var(--bg-elev-2)] rounded-sm"
          style={{ width: `${100 - i * 10}%` }}
        />
      ))}
    </div>
  );
}
