import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, LogOut, PlusCircle, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
              <div className="bg-brand-600 p-2 rounded-lg">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">AI Campaign Agent</span>
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              <Link to="/dashboard" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                <LayoutDashboard className="h-4 w-4 mr-1.5" /> Dashboard
              </Link>
              <Link to="/campaigns/new" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                <PlusCircle className="h-4 w-4 mr-1.5" /> New Campaign
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3 bg-gray-50 py-1.5 px-3 rounded-full border border-gray-200">
                <img className="h-8 w-8 rounded-full border border-gray-300" src={user.avatar || 'https://via.placeholder.com/150'} alt={user.name} />
                <span className="text-sm font-medium text-gray-700 hidden md:block">{user.name}</span>
                <button
                  onClick={logout}
                  className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
