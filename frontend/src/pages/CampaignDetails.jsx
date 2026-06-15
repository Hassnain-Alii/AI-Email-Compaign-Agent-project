import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Sparkles, Send, Settings, Save, Smartphone, Monitor, ChevronLeft, CalendarClock, ShieldAlert, Copy } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../utils/api';

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('content');
  const [previewMode, setPreviewMode] = useState('desktop');
  
  // Local Form State
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    recipientListId: '',
    directRecipients: '', // New field for manual emails
    prompt: '',
    htmlContent: '',
    isHtml: true,
    generationType: 'ai',
    fromEmail: '',
    status: 'draft'
  });
  
  const [tone, setTone] = useState('professional');

  const { data: campaign, isLoading: campaignLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => (await api.get(`/campaigns/${id}`)).data,
  });

  const { data: lists } = useQuery({
    queryKey: ['lists'],
    queryFn: async () => (await api.get('/lists')).data,
  });

  const { data: verifiedSenders } = useQuery({
    queryKey: ['verifiedSenders'],
    queryFn: async () => (await api.get('/campaigns/senders/verified')).data,
  });

  const [hasLoadedData, setHasLoadedData] = useState(false);

  useEffect(() => {
    if (campaign && !hasLoadedData) {
      setFormData({
        title: campaign.title || '',
        subject: campaign.subject || '',
        recipientListId: campaign.recipientListId?._id || '',
        directRecipients: Array.isArray(campaign.directRecipients) 
          ? campaign.directRecipients.join(', ') 
          : (campaign.directRecipients || ''),
        prompt: campaign.prompt || '',
        htmlContent: campaign.htmlContent || campaign.generatedEmail || '',
        isHtml: campaign.isHtml || true,
        fromEmail: campaign.fromEmail || '',
        generationType: campaign.generationType || 'ai',
        status: campaign.status
      });
      setHasLoadedData(true);
    }
  }, [campaign, hasLoadedData]);

  const updateMutation = useMutation({
    mutationFn: (data) => api.put(`/campaigns/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', id] });
      toast.success('Changes saved');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save')
  });

  const generateEmailMutation = useMutation({
    mutationFn: async () => {
      // Auto-save changes first so we don't lose them
      await api.put(`/campaigns/${id}`, getFormattedData());
      return api.post(`/campaigns/${id}/generate`, { tone, instructions: formData.prompt });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['campaign', id] });
      setFormData(prev => ({ ...prev, htmlContent: res.data.generatedEmail }));
      toast.success('AI magic complete! Content updated.');
    },
    onError: (err) => toast.error('AI had a hiccup. Try again?')
  });

  const sendCampaignMutation = useMutation({
    mutationFn: () => api.post(`/campaigns/${id}/send`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', id] });
      toast.success('Emails are on their way! 🚀');
      navigate('/campaigns');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Send failed')
  });

  const getFormattedData = () => {
    let direct = formData.directRecipients;
    if (typeof direct === 'string') {
      direct = direct.split(/[,|\n]/).map(e => e.trim()).filter(e => e !== '');
    } else if (!Array.isArray(direct)) {
      direct = [];
    }
    
    return {
      ...formData,
      directRecipients: direct
    };
  };

  const duplicateMutation = useMutation({
    mutationFn: () => api.post(`/campaigns/${id}/duplicate`),
    onSuccess: (res) => {
      toast.success('Campaign duplicated!');
      navigate(`/campaigns/${res.data._id}`);
    },
    onError: () => toast.error('Failed to duplicate')
  });

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(getFormattedData());
      toast.success('Draft saved!');
    } catch (e) {
      toast.error('Save failed');
    }
  };

  const handleSend = async () => {
    const formatted = getFormattedData();
    
    if(!formData.subject || formData.subject === 'No Subject') {
      return toast.error('Subject line is required');
    }
    
    if(!formData.recipientListId && (!formatted.directRecipients || formatted.directRecipients.length === 0)) {
      return toast.error('Select a list or add emails');
    }

    if(!formData.htmlContent) {
      return toast.error('Email is currently empty');
    }

    if(confirm('Ready to launch this campaign?')) {
      try {
        await api.put(`/campaigns/${id}`, formatted);
        sendCampaignMutation.mutate();
      } catch (err) {
        toast.error('Failed to sync before sending');
      }
    }
  };

  if (campaignLoading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div></div>;

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col animate-fade-in -m-8 mx-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/campaigns')} className="text-gray-400 hover:text-gray-600">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">{formData.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
               <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize border
                ${formData.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {formData.status}
              </span>
              <span className="text-xs text-gray-500">Method: {formData.generationType === 'ai' ? 'AI Assistant' : 'Manual Builder'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {formData.status === 'completed' && (
            <button 
              onClick={() => duplicateMutation.mutate()}
              disabled={duplicateMutation.isPending}
              className="inline-flex items-center px-4 py-2 border border-brand-300 shadow-sm text-sm font-medium rounded-lg text-brand-700 bg-brand-50 hover:bg-brand-100"
            >
              <Copy className="-ml-1 mr-2 h-4 w-4" />
              Duplicate & Edit
            </button>
          )}
          <button 
            onClick={handleSave}
            disabled={updateMutation.isPending || formData.status === 'completed' || formData.status === 'sending'}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <Save className="-ml-1 mr-2 h-4 w-4 text-gray-500"/>
            {formData.status === 'completed' ? 'Saved' : 'Save Draft'}
          </button>
          <button
            onClick={handleSend}
            disabled={formData.status === 'sending' || formData.status === 'completed' || sendCampaignMutation.isPending}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            {sendCampaignMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="-ml-1 mr-2 h-4 w-4" />
                {formData.status === 'completed' ? 'Sent' : 'Send Now'}
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Tabs & Controls */}
        <div className="w-1/3 min-w-[350px] bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'settings' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <Settings className="w-4 h-4 inline mr-2"/> Settings
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'content' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <Sparkles className="w-4 h-4 inline mr-2"/> Content
            </button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            {activeTab === 'settings' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject Line</label>
                  <input type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">From Email</label>
                  <select 
                    value={formData.fromEmail} 
                    onChange={e => setFormData({...formData, fromEmail: e.target.value})}
                    className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-lg bg-white shadow-sm"
                  >
                    <option value="">Default (hassnainalyy@gmail.com)</option>
                    {verifiedSenders?.filter(email => email !== 'hassnainalyy@gmail.com').map(email => (
                      <option key={email} value={email}>{email}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-500 mt-1.5 font-medium">Select a verified sender. Emails sent from unverified addresses may go to spam.</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">Recipient Audience</label>
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, recipientListId: '', directRecipients: ''})}
                      className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                    >
                      Clear Selection
                    </button>
                  </div>
                  
                  {formData.directRecipients !== undefined && (
                    <div className="space-y-3 p-3 border border-gray-200 rounded-lg bg-gray-50/50">
                      <select 
                        value={formData.recipientListId} 
                        onChange={e => setFormData({...formData, recipientListId: e.target.value})} 
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-md bg-white"
                      >
                        <option value="">Select a saved list...</option>
                        {lists?.map(l => (
                          <option key={l._id} value={l._id}>{l.name} ({l.recipientCount})</option>
                        ))}
                      </select>
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                          <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-gray-500 rounded-full border border-gray-100">And/Or enter manually</span>
                        </div>
                      </div>

                      <textarea
                        rows={3}
                        placeholder="Enter email addresses separated by commas..."
                        value={formData.directRecipients}
                        onChange={e => setFormData({...formData, directRecipients: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm bg-white"
                      />
                      <p className="text-[10px] text-gray-400">Example: john@example.com, sara@test.com</p>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t border-gray-200">
                   <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                     <ShieldAlert className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                     <div>
                       <h4 className="text-sm font-semibold text-yellow-800">Spam Guidelines</h4>
                       <p className="text-xs text-yellow-700 mt-1 font-medium">Keep your subject concise and avoid ALL CAPS. Verify your domain in Sendgrid to avoid promo tab filtering.</p>
                     </div>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-6 animate-fade-in h-full flex flex-col">
                <div className="space-y-4 pb-4 border-b border-gray-200 shrink-0">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Instructions / Prompt</label>
                      <textarea rows={4} value={formData.prompt} onChange={e => setFormData({...formData, prompt: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm" placeholder="E.g. Write a friendly newsletter..." />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700">Tone</label>
                         <select value={tone} onChange={e => setTone(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-brand-500 focus:border-brand-500">
                           <option value="professional">Professional</option>
                           <option value="friendly">Friendly</option>
                           <option value="urgent">Urgent</option>
                           <option value="funny">Funny</option>
                         </select>
                    </div>
                    <button
                      onClick={() => generateEmailMutation.mutate()}
                      disabled={generateEmailMutation.isPending}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {generateEmailMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          AI is working on your email...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          {formData.htmlContent ? 'Regenerate Email' : 'Generate Email'}
                        </>
                      )}
                    </button>
                  </div>
                <div className="flex-1 flex flex-col">
                   <label className="block text-sm font-medium text-gray-700 mb-2">Content Editor</label>
                   <div className="flex-1 w-full flex flex-col ReactQuillWrapper">
                      <ReactQuill 
                        theme="snow" 
                        value={formData.htmlContent} 
                        onChange={(content) => setFormData({...formData, htmlContent: content, isHtml: true})} 
                        className="h-[400px] pb-10"
                        placeholder={formData.generationType === 'ai' ? "Generate content or start typing here..." : "Start typing here..."}
                      />
                    </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 bg-gray-100 flex flex-col relative overflow-hidden">
           <div className="absolute top-4 right-4 bg-white rounded-lg shadow-sm border border-gray-200 flex p-1 z-10">
              <button 
                onClick={() => setPreviewMode('desktop')}
                className={`p-1.5 rounded-md ${previewMode === 'desktop' ? 'bg-gray-100 text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="Desktop Preview"
              >
                <Monitor className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setPreviewMode('mobile')}
                className={`p-1.5 rounded-md ${previewMode === 'mobile' ? 'bg-gray-100 text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="Mobile Preview"
              >
                <Smartphone className="h-5 w-5" />
              </button>
           </div>
           <div className="flex-1 p-8 flex items-center justify-center overflow-y-auto">
              <div 
                className={`bg-white shadow-xl border border-gray-200 transition-all duration-300 ease-in-out ${previewMode === 'mobile' ? 'w-[375px] rounded-3xl min-h-[667px]' : 'w-full max-w-3xl rounded-lg min-h-[500px]'}`}
              >
                {/* Email Client Header Chrome */}
                <div className={`bg-gray-50 border-b border-gray-200 p-4 ${previewMode === 'mobile' ? 'rounded-t-3xl' : 'rounded-t-lg'}`}>
                  <div className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2 mb-2 flex">
                     <span className="text-gray-500 w-12 shrink-0">From:</span> 
                     <div className="text-brand-700 truncate">
                        {formData.fromEmail || 'Default (hassnainalyy@gmail.com)'}
                     </div>
                   </div>
                   <div className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2 mb-2 flex">
                     <span className="text-gray-500 w-12 shrink-0">To:</span> 
                     <div className="text-brand-700 truncate">
                        {formData.recipientListId && (
                          <span className="bg-brand-50 px-2 py-0.5 rounded border border-brand-100 mr-2">
                             List: {lists?.find(l => l._id === formData.recipientListId)?.name}
                          </span>
                        )}
                        {formData.directRecipients && (
                           <span className={formData.recipientListId ? 'text-gray-400 text-xs italic' : ''}>
                             {typeof formData.directRecipients === 'string' ? formData.directRecipients : formData.directRecipients.join(', ')}
                           </span>
                        )}
                        {!formData.recipientListId && !formData.directRecipients && <span className="text-gray-400 font-normal">[No recipients selected]</span>}
                     </div>
                   </div>
                   <p className="text-sm font-bold text-gray-900">
                     <span className="text-gray-500 w-12 inline-block font-medium">Subj:</span> {formData.subject || 'No Subject'}
                   </p>
                </div>
                
                {/* Email Content Body */}
                <div className={`p-6 bg-white ${previewMode === 'mobile' ? 'rounded-b-3xl' : 'rounded-b-lg'}`}>
                  {formData.htmlContent ? (
                    <div 
                      className="prose prose-sm max-w-none text-gray-800"
                      dangerouslySetInnerHTML={{ __html: formData.htmlContent }} 
                    />
                  ) : (
                    <div className="text-center py-20 text-gray-400">
                      Content will appear here...
                    </div>
                  )}
                </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default CampaignDetails;
