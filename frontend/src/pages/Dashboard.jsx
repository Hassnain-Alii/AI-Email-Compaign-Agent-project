import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  PlusCircle, FileText, CheckCircle2, BarChart2,
  Users, TrendingUp, Send, ArrowRight, Activity, Clock
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, ArcElement, Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import api from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import { SkeletonDashboard } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

/* ─── Stat Card ─────────────────────── */
const StatCard = ({ label, value, icon: Icon, gradient, trend }) => (
  <div className="card-hover p-5 flex items-center gap-4 animate-slide-up">
    <div className={`stat-icon bg-gradient-to-br ${gradient} shadow-sm`}>
      <Icon className="h-5 w-5 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide truncate">{label}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">{value}</p>
    </div>
    {trend !== undefined && (
      <div className="text-right">
        <span className={`text-xs font-semibold ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      </div>
    )}
  </div>
);

/* ─── Main ─────────────────────────── */
const Dashboard = () => {
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['dashboardAnalytics'],
    queryFn: async () => (await api.get('/analytics/dashboard')).data,
  });

  if (isLoading) return <SkeletonDashboard />;

  if (error) return (
    <div className="card p-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
      Error loading dashboard. Make sure the backend is running and you are logged in.
    </div>
  );

  if (!analytics) return null;

  const { stats, totalCampaigns, totalRecipients, recentCampaigns } = analytics;

  const openRate = stats.totalSent ? Math.round((stats.totalOpened / stats.totalSent) * 100) : 0;
  const clickRate = stats.totalSent ? Math.round((stats.totalClicked / stats.totalSent) * 100) : 0;

  /* Chart data */
  const funnelData = {
    labels: ['Sent', 'Delivered', 'Opened', 'Clicked'],
    datasets: [{
      label: 'Engagement',
      data: [stats.totalSent, stats.totalDelivered, stats.totalOpened, stats.totalClicked],
      fill: true,
      borderColor: '#0ea5e9',
      backgroundColor: 'rgba(14,165,233,0.08)',
      pointBackgroundColor: '#0284c7',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
      tension: 0.4,
    }],
  };

  const donutData = {
    labels: ['Delivered', 'Failed', 'Pending'],
    datasets: [{
      data: [stats.totalDelivered || 0, stats.totalFailed || 0, stats.totalPending || 0],
      backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } },
      y: { grid: { color: 'rgba(148,163,184,0.1)' }, ticks: { color: '#94a3b8', font: { size: 11 } } },
    },
  };

  const donutOptions = {
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#94a3b8', padding: 16, font: { size: 11 }, usePointStyle: true, pointStyleWidth: 8 },
      },
      tooltip: {
        backgroundColor: '#1e293b', titleColor: '#f8fafc', bodyColor: '#94a3b8',
        borderColor: '#334155', borderWidth: 1, padding: 10, cornerRadius: 8,
      },
    },
  };

  const stats_cards = [
    { label: 'Total Campaigns', value: totalCampaigns, icon: FileText, gradient: 'from-brand-400 to-brand-500' },
    { label: 'Total Recipients', value: totalRecipients, icon: Users, gradient: 'from-violet-400 to-violet-600' },
    { label: 'Emails Sent', value: stats.totalSent, icon: Send, gradient: 'from-emerald-400 to-emerald-600' },
    { label: 'Open Rate', value: `${openRate}%`, icon: TrendingUp, gradient: 'from-amber-400 to-orange-500' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="lg:hidden">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your campaign performance at a glance</p>
        </div>
        <div className="hidden lg:block" />
        <Link to="/campaigns/new" className="btn-primary">
          <PlusCircle className="h-4 w-4" />
          New Campaign
        </Link>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats_cards.map((s, i) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Line chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-brand-400" /> Engagement Funnel
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Campaign-wide delivery and engagement</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-brand-500 bg-brand-25 dark:bg-brand-900/20 px-3 py-1.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse-soft" />
              Live
            </div>
          </div>
          <div className="h-[240px]">
            <Line data={funnelData} options={chartOptions} />
          </div>
        </div>

        {/* Donut chart */}
        <div className="card p-6">
          <div className="mb-5">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <BarChart2 className="h-4.5 w-4.5 text-violet-400" /> Delivery Status
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Breakdown of email outcomes</p>
          </div>
          <div className="h-[220px]">
            <Doughnut data={donutData} options={donutOptions} />
          </div>
          {/* Center stat */}
          <div className="text-center mt-3">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalDelivered}</p>
            <p className="text-xs text-slate-400">delivered</p>
          </div>
        </div>
      </div>

      {/* Recent Campaigns table */}
      <div className="table-container">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border dark:border-border-dark bg-surface-secondary dark:bg-surface-dark-tertiary">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Recent Campaigns</h3>
          <Link to="/campaigns" className="text-xs font-medium text-brand-500 hover:text-brand-600 flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {!recentCampaigns || recentCampaigns.length === 0 ? (
          <EmptyState
            icon={Send}
            title="No campaigns yet"
            description="Create your first campaign to start reaching your audience."
            action={<Link to="/campaigns/new" className="btn-primary">Create Campaign</Link>}
          />
        ) : (
          <table className="min-w-full">
            <thead className="table-head">
              <tr>
                <th className="table-th">Campaign</th>
                <th className="table-th hidden sm:table-cell">Status</th>
                <th className="table-th hidden md:table-cell">Audience</th>
                <th className="table-th text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentCampaigns.map((campaign) => (
                <tr key={campaign._id} className="table-row">
                  <td className="table-td">
                    <Link to={`/campaigns/${campaign._id}`} className="font-semibold text-slate-800 dark:text-slate-100 hover:text-brand-500 transition-colors line-clamp-1">
                      {campaign.title}
                    </Link>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{campaign.subject}</p>
                  </td>
                  <td className="table-td hidden sm:table-cell">
                    <StatusBadge status={campaign.status} />
                  </td>
                  <td className="table-td hidden md:table-cell text-slate-500">
                    {campaign.recipientListId?.name || '—'}
                  </td>
                  <td className="table-td text-right text-slate-400 text-xs whitespace-nowrap">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
