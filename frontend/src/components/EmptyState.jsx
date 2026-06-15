const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="empty-state">
    <div className="empty-icon">
      <Icon className="h-8 w-8 text-slate-400 dark:text-slate-500" />
    </div>
    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
    {description && (
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">{description}</p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
