import { useQuery } from '@tanstack/react-query';
import { BarChart2, Activity, PieChart } from 'lucide-react';
import api from '../utils/api';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Analytics = () => {
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['dashboardAnalytics'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/dashboard');
      return data;
    },
  });

  if (isLoading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div></div>;
  if (error) return <div className="text-red-500 bg-red-50 p-4 rounded-xl border border-red-100">Error loading analytics. Please ensure you are logged in.</div>;
  if (!analytics) return null;

  const { stats } = analytics;

  const engagementData = {
    labels: ['Opened', 'Clicked'],
    datasets: [{
      label: 'Engagement',
      data: [stats.totalOpened, stats.totalClicked],
      backgroundColor: ['#3b82f6', '#8b5cf6'],
    }]
  };

  const deliveryData = {
    labels: ['Delivered', 'Failed'],
    datasets: [{
      data: [stats.totalDelivered, stats.totalFailed],
      backgroundColor: ['#22c55e', '#ef4444'],
    }]
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart2 className="h-6 w-6 text-brand-600"/> Full Analytics Report
        </h1>
        <p className="text-gray-500 mt-1">Deep dive into your campaign performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 shadow-sm rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Activity className="h-5 w-5 text-gray-400"/> Engagement Metrics</h3>
           <div className="h-[300px] flex justify-center">
            <Bar data={engagementData} options={{ maintainAspectRatio: false }} />
           </div>
        </div>

        <div className="bg-white p-6 shadow-sm rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><PieChart className="h-5 w-5 text-gray-400"/> Delivery Success</h3>
           <div className="h-[300px] flex justify-center">
            <Doughnut data={deliveryData} options={{ maintainAspectRatio: false }} />
           </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Sent', val: stats.totalSent },
          { label: 'Delivered', val: stats.totalDelivered },
          { label: 'Opened', val: stats.totalOpened },
          { label: 'Clicked', val: stats.totalClicked },
        ].map(s => (
          <div key={s.label} className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm text-center">
            <p className="text-2xl font-bold text-gray-900">{s.val}</p>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Analytics;
