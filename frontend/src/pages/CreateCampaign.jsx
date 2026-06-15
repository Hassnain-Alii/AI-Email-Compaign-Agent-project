import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { PenTool, Sparkles, Briefcase } from 'lucide-react';
import api from '../utils/api';

const CreateCampaign = () => {
  const [title, setTitle] = useState('');
  const [generationType, setGenerationType] = useState('ai');
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newCampaign) => api.post('/campaigns', newCampaign),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign created successfully!');
      navigate(`/campaigns/${response.data._id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create campaign');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) {
      toast.error('Please enter a campaign title');
      return;
    }
    
    mutation.mutate({ 
      title, 
      subject: 'Draft Subject', // Default 
      prompt: generationType === 'ai' ? 'Write a promotional email...' : '',
      generationType,
      isHtml: generationType === 'manual' // manual is HTML builder
    });
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">How would you like to build your email?</h1>
        <p className="mt-2 text-gray-500">Choose a path to get started with your new campaign.</p>
      </div>

      <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700">
              <span className="flex items-center gap-2 mb-2">Campaign Name</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:bg-white focus:ring-brand-500 focus:border-brand-500 sm:text-base transition-colors"
              placeholder="e.g. Summer Sale 2024"
              autoFocus
            />
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
             <button
              type="button"
              onClick={() => navigate('/campaigns')}
              className="bg-white py-2.5 px-5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 mr-4 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex justify-center py-2.5 px-8 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {mutation.isPending ? 'Starting...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;
