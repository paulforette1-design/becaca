function SkeletonCard() {
  return (
    <div className="bg-caca-surface rounded-2xl overflow-hidden animate-pulse mx-4 mb-4">
      <div className="h-64 bg-caca-muted/30" />
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-caca-muted/30" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-caca-muted/30 rounded-full w-1/3" />
          <div className="h-3 bg-caca-muted/20 rounded-full w-1/4" />
        </div>
        <div className="h-6 w-20 bg-caca-muted/30 rounded-full" />
      </div>
    </div>
  )
}

export default function SkeletonLoader({ count = 3 }) {
  return (
    <div className="pt-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
