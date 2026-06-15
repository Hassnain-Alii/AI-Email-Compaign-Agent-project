import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Users, Search, Download, Upload, Trash2, Filter } from 'lucide-react';
import api from '../utils/api';

const Recipients = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [listFilter, setListFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());

  const { data: lists } = useQuery({
    queryKey: ['lists'],
    queryFn: async () => (await api.get('/lists')).data,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['recipients', page, search, listFilter],
    queryFn: async () => {
      const q = new URLSearchParams({ page, limit: 15 });
      if (search) q.append('search', search);
      if (listFilter) q.append('listId', listFilter);
      return (await api.get(`/recipients?${q.toString()}`)).data;
    },
    keepPreviousData: true
  });

  const uploadMutation = useMutation({
    mutationFn: (formData) => api.post('/recipients/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['recipients'] });
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      toast.success(`Processed. Added ${res.data.added}, Updated ${res.data.updated}.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Upload failed')
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids) => api.post('/recipients/bulk-delete', { ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipients'] });
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      toast.success('Recipients deleted');
      setSelectedIds(new Set());
    }
  });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) { toast.error('Please upload a CSV file'); return; }
    
    const formData = new FormData();
    formData.append('file', file);
    if (listFilter) formData.append('listId', listFilter);
    uploadMutation.mutate(formData);
  };

  const handleExport = async () => {
    const q = listFilter ? `?listId=${listFilter}` : '';
    window.location.href = `${api.defaults.baseURL}/recipients/export${q}`; // Direct trigger since it uses token? Wait, tokens in native window location won't have Bearer.
    // We should either fetch blob and generate a link, or send token in query param.
    // For MVP, we will fetch blob.
    try {
      const response = await api.get(`/recipients/export${q}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'recipients.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch(err) {
      toast.error('Failed to export');
    }
  };

  const toggleSelection = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleAll = () => {
    if (selectedIds.size === data?.recipients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data?.recipients.map(r => r._id)));
    }
  };

  const executeBulkDelete = () => {
    if(window.confirm(`Delete ${selectedIds.size} recipients?`)) {
      bulkDeleteMutation.mutate(Array.from(selectedIds));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-brand-600"/> All Recipients
          </h1>
          <p className="text-gray-500 mt-1">Manage all your contacts globally.</p>
        </div>
        
        <div className="flex gap-3">
          <button onClick={handleExport} className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">
            <Download className="mr-2 h-4 w-4 text-gray-400" /> Export CSV
          </button>
          <div className="relative">
            <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" id="csv-upload-global"/>
            <label htmlFor="csv-upload-global" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-brand-600 hover:bg-brand-700 cursor-pointer">
              <Upload className="mr-2 h-4 w-4" /> {uploadMutation.isPending ? '...' : 'Import CSV'}
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative rounded-md shadow-sm w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div className="relative">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
              <select
                value={listFilter}
                onChange={(e) => { setListFilter(e.target.value); setPage(1); }}
                className="pl-10 block w-full py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-md"
              >
                <option value="">All Lists</option>
                {lists?.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
              </select>
            </div>
          </div>

          {selectedIds.size > 0 && (
            <button onClick={executeBulkDelete} className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
              <Trash2 className="mr-2 h-4 w-4"/> Delete Selected ({selectedIds.size})
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left w-12">
                      <input type="checkbox" onChange={toggleAll} checked={data?.recipients.length > 0 && selectedIds.size === data.recipients.length} className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 h-4 w-4"/>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lists</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data?.recipients.map((recipient) => (
                    <tr key={recipient._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input type="checkbox" checked={selectedIds.has(recipient._id)} onChange={() => toggleSelection(recipient._id)} className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 h-4 w-4"/>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{recipient.email}</div>
                        <div className="text-sm text-gray-500">{recipient.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {recipient.lists.map(l => (
                            <span key={l._id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              {l.name}
                            </span>
                          ))}
                          {recipient.lists.length === 0 && <span className="text-gray-400 text-xs">No lists</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(recipient.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {data?.recipients.length === 0 && (
                     <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">No recipients found. Try adjusting filters or import a CSV.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {data?.pages > 1 && (
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 disabled:opacity-50">Previous</button>
                <span className="text-sm text-gray-700">Page {page} of {data.pages}</span>
                <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages} className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 disabled:opacity-50">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Recipients;
