export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-secondary/50 rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-28 bg-secondary/30 rounded-2xl border border-border/30" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-72 bg-secondary/30 rounded-2xl border border-border/30" />
        <div className="h-72 bg-secondary/30 rounded-2xl border border-border/30" />
      </div>
    </div>
  );
}
