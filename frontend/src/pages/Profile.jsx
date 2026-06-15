import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, ShieldAlert, Key } from 'lucide-react';

const Profile = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <User className="h-6 w-6 text-brand-600"/> Profile Settings
        </h1>
        <p className="text-gray-500 mt-1">Manage your account and preferences.</p>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-8 sm:flex sm:items-center sm:gap-6 border-b border-gray-200">
           <img className="h-24 w-24 rounded-full border border-gray-300 shadow-md" src={user?.avatar || 'https://via.placeholder.com/150'} alt={user?.name} />
           <div className="mt-4 sm:mt-0">
             <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
             <p className="text-sm font-medium text-gray-500 flex items-center mt-1"><Mail className="h-4 w-4 mr-2" /> {user?.email}</p>
             <div className="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
               {user?.role === 'admin' ? 'Administrator' : 'Standard User'}
             </div>
           </div>
        </div>
        
        <div className="px-8 py-6 space-y-4">
           <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Account Security</h3>
           <div className="bg-gray-50 p-4 rounded-lg flex items-start gap-4">
               <ShieldAlert className="h-6 w-6 text-green-500 shrink-0" />
               <div>
                  <p className="text-sm font-medium text-gray-900">Google OAuth Secured</p>
                  <p className="text-xs text-gray-500 mt-1">Your account uses secure single sign-on. Identity lifecycle managed externally.</p>
               </div>
           </div>
           
           <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2 pt-4">API Configurations (Global)</h3>
           <div className="bg-gray-50 p-4 rounded-lg flex items-start gap-4">
               <Key className="h-6 w-6 text-yellow-500 shrink-0" />
               <div>
                  <p className="text-sm font-medium text-gray-900">Missing API Keys Detected</p>
                  <p className="text-xs text-gray-500 mt-1">To use real live-sending (SendGrid) and real GenAI (OpenAI), configure them in your server's .env file. The application is currently functioning in Sandbox Mode.</p>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
