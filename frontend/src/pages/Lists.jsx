import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ListOrdered, Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../utils/api';

const Lists = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const { data: lists, isLoading } = useQuery({
    queryKey: ['lists'],
    queryFn: async () => {
      const { data } = await api.get('/lists');
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: (listData) => 
      editingList 
        ? api.put(`/lists/${editingList._id}`, listData)
        : api.post('/lists', listData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      toast.success(editingList ? 'List updated' : 'List created');
      closeModal();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save list')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/lists/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      toast.success('List deleted');
    }
  });

  const openModal = (list = null) => {
    setEditingList(list);
    setFormData(list ? { name: list.name, description: list.description || '' } : { name: '', description: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingList(null);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ListOrdered className="h-6 w-6 text-brand-600"/> Contact Lists
          </h1>
          <p className="text-gray-500 mt-1">Organize your recipients into targeted groups.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-brand-600 hover:bg-brand-700 transition-colors"
        >
          <Plus className="-ml-1 mr-2 h-4 w-4" />
          Create List
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">List Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscribers</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lists?.map((list) => (
                  <tr key={list._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{list.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{list.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800">
                         {list.recipientCount} Contacts
                       </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openModal(list)} className="text-brand-600 hover:text-brand-900 mr-4">
                        <Edit2 className="h-4 w-4 inline" /> Edit
                      </button>
                      <button onClick={() => { if(window.confirm('Delete list? Contacts will remain.')) deleteMutation.mutate(list._id) }} className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-4 w-4 inline" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {lists?.length === 0 && (
                   <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No contact lists found. Create your first list!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={closeModal}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData); }}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">{editingList ? 'Edit List' : 'Create List'}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">List Name</label>
                      <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm" rows="3" />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" disabled={saveMutation.isPending} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-600 text-base font-medium text-white hover:bg-brand-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                    {saveMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                  <button type="button" onClick={closeModal} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lists;
