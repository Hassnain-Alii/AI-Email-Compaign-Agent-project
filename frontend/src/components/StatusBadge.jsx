import { CheckCircle2, Clock, XCircle, FileText, SendHorizontal, AlertCircle } from 'lucide-react';

const statusConfig = {
  completed: {
    className: 'badge-success',
    icon: CheckCircle2,
    label: 'Completed',
  },
  sending: {
    className: 'badge-info',
    icon: SendHorizontal,
    label: 'Sending',
    pulse: true,
  },
  scheduled: {
    className: 'badge-warning',
    icon: Clock,
    label: 'Scheduled',
  },
  failed: {
    className: 'badge-danger',
    icon: XCircle,
    label: 'Failed',
  },
  draft: {
    className: 'badge-draft',
    icon: FileText,
    label: 'Draft',
  },
  sent: {
    className: 'badge-success',
    icon: CheckCircle2,
    label: 'Sent',
  },
  delivered: {
    className: 'badge-success',
    icon: CheckCircle2,
    label: 'Delivered',
  },
  pending: {
    className: 'badge-warning',
    icon: Clock,
    label: 'Pending',
  },
  bounced: {
    className: 'badge-danger',
    icon: AlertCircle,
    label: 'Bounced',
  },
};

const StatusBadge = ({ status, size = 'sm' }) => {
  const config = statusConfig[status] || statusConfig.draft;
  const Icon = config.icon;

  return (
    <span className={`${config.className} text-xs`}>
      <Icon className={`h-3 w-3 ${config.pulse ? 'animate-pulse-soft' : ''}`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
