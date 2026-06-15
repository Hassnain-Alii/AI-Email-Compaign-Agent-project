import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PlusCircle, Copy, Trash2, Edit2, Send } from 'lucide-react';
import api from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import { SkeletonTableBody } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const Campaigns = () => {
  const queryClient = useQueryClient();

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => (await api.get('/campaigns')).data,
  });

  const duplicateMutation = useMutation({
    mutationFn: (id) => api.post(`/campaigns/${id}/duplicate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign duplicated');
    },
    onError: () => toast.error('Failed to duplicate'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/campaigns/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign deleted');
    },
    onError: () => toast.error('Failed to delete'),
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header lg:hidden">
        <div>
          <h1 className="page-title">Campaigns</h1>
          <p className="page-subtitle">Create, manage and send email campaigns</p>
        </div>
        <Link to="/campaigns/new" className="btn-primary">
          <PlusCircle className="h-4 w-4" /> New Campaign
        </Link>
      </div>
      <div className="hidden lg:flex justify-end">
        <Link to="/campaigns/new" className="btn-primary">
          <PlusCircle className="h-4 w-4" /> New Campaign
        </Link>
      </div>

      <div className="table-container">
        <table className="min-w-full">
          <thead className="table-head">
            <tr>
              <th className="table-th">Campaign</th>
              <th className="table-th">Status</th>
              <th className="table-th hidden md:table-cell">Audience</th>
              <th className="table-th hidden sm:table-cell">Type</th>
              <th className="table-th hidden lg:table-cell">Created</th>
              <th className="table-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonTableBody rows={5} cols={6} />
            ) : campaigns?.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    icon={Send}
                    title="No campaigns yet"
                    description="Start by creating your first email campaign."
                    action={<Link to="/campaigns/new" className="btn-primary">Create Campaign</Link>}
                  />
                </td>
              </tr>
            ) : (
              campaigns?.map((campaign) => (
                <tr key={campaign._id} className="table-row group">
                  <td className="table-td">
                    <Link
                      to={`/campaigns/${campaign._id}`}
                      className="font-semibold text-slate-800 dark:text-slate-100 hover:text-brand-500 transition-colors"
                    >
                      {campaign.title}
                    </Link>
                    <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[180px]" title={campaign.subject}>
                      {campaign.subject}
                    </p>
                  </td>
                  <td className="table-td">
                    <StatusBadge status={campaign.status} />
                  </td>
                  <td className="table-td hidden md:table-cell text-slate-500 dark:text-slate-400">
                    {campaign.recipientListId?.name || (campaign.directRecipients?.length > 0 ? (
                      <span className="badge badge-draft text-[10px]">Direct ({campaign.directRecipients.length})</span>
                    ) : (
                      <span className="italic text-slate-400 dark:text-slate-500">None selected</span>
                    ))}
                  </td>
                  <td className="table-td hidden sm:table-cell">
                    <span className={`badge ${campaign.generationType === 'ai' ? 'badge-info' : 'badge-draft'}`}>
                      {campaign.generationType === 'ai' ? '✦ AI' : '✎ Manual'}
                    </span>
                  </td>
                  <td className="table-td hidden lg:table-cell text-slate-400 text-xs whitespace-nowrap">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </td>
                  <td className="table-td">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/campaigns/${campaign._id}`} className="btn-icon" title="Edit">
                        <Edit2 className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        onClick={() => duplicateMutation.mutate(campaign._id)}
                        className="btn-icon"
                        title="Duplicate"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this campaign permanently?')) deleteMutation.mutate(campaign._id);
                        }}
                        className="btn-icon hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Campaigns;
