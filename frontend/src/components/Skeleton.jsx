// Skeleton loaders – reusable building blocks

export const SkeletonLine = ({ className = 'h-4 w-full' }) => (
  <div className={`skeleton ${className}`} />
);

export const SkeletonCard = ({ className = '' }) => (
  <div className={`card p-5 space-y-4 ${className}`}>
    <div className="flex items-center gap-3">
      <div className="skeleton h-10 w-10 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonLine className="h-3 w-24" />
        <SkeletonLine className="h-5 w-16" />
      </div>
    </div>
  </div>
);

export const SkeletonRow = ({ cols = 4 }) => (
  <tr className="border-t border-border dark:border-border-dark">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-5 py-4">
        <SkeletonLine className={`h-4 ${i === 0 ? 'w-40' : 'w-24'}`} />
      </td>
    ))}
  </tr>
);

export const SkeletonTableBody = ({ rows = 5, cols = 4 }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonRow key={i} cols={cols} />
    ))}
  </>
);

export const SkeletonDashboard = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 card p-6 space-y-4">
        <SkeletonLine className="h-5 w-40" />
        <div className="skeleton h-64 w-full rounded-xl" />
      </div>
      <div className="card p-6 space-y-4">
        <SkeletonLine className="h-5 w-32" />
        <div className="skeleton h-64 w-full rounded-full mx-auto" />
      </div>
    </div>
  </div>
);
