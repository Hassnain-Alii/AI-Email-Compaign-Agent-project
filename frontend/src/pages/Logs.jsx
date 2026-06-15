import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Mail, Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../utils/api';

const Logs = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['logs', page, status],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/logs?page=${page}&limit=10${status ? `&status=${status}` : ''}`);
      return data;
    },
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
      case 'delivered': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
      case 'bounced': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="h-6 w-6 text-brand-600"/> Delivery Logs
          </h1>
          <p className="text-gray-500 mt-1">Real-time status of all dispatched emails.</p>
        </div>
        <div>
          <select 
            value={status} 
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="border-gray-300 rounded-lg shadow-sm text-sm focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="sent">Sent</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
           <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                  {data?.logs.map(log => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 truncate max-w-[200px]" title={log.recipientId?.email || log.directEmail}>
                          {log.recipientId?.email || log.directEmail || 'N/A'}
                        </div>
                        {log.recipientId?.name && <p className="text-xs text-gray-400 font-normal">{log.recipientId.name}</p>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 truncate max-w-xs cursor-help" title={log.campaignId?.title}>
                        {log.campaignId?.title || 'Deleted Campaign'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                           {getStatusIcon(log.status)}
                           <span className="capitalize">{log.status}</span>
                        </div>
                        {log.error && <p className="text-xs text-red-500 mt-1 max-w-xs truncate">{log.error}</p>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {data?.logs.length === 0 && (
                     <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No logs found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {data?.pages > 1 && (
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">Page {page} of {data.pages}</span>
                <button
                  onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                  disabled={page === data.pages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Logs;
