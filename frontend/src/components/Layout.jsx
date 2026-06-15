import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const pageTitles = {
  '/dashboard':  { title: 'Dashboard',   subtitle: 'Your campaign performance at a glance' },
  '/campaigns':  { title: 'Campaigns',   subtitle: 'Create, manage and send email campaigns' },
  '/recipients': { title: 'Recipients',  subtitle: 'Manage your global contact database' },
  '/lists':      { title: 'Lists',       subtitle: 'Organize contacts into targeted audiences' },
  '/analytics':  { title: 'Analytics',   subtitle: 'Deep insights into your email performance' },
  '/logs':       { title: 'Email Logs',  subtitle: 'Real-time delivery status of all emails' },
  '/profile':    { title: 'Settings',    subtitle: 'Manage your account and preferences' },
};

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  // Match broadly (campaigns/:id etc.)
  const pageKey = Object.keys(pageTitles).find(k => pathname.startsWith(k) && k !== '/campaigns' || pathname === k);
  const pageInfo = pageTitles[pageKey] || { title: '', subtitle: '' };

  return (
    <div className="flex h-screen bg-surface-secondary dark:bg-surface-dark overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar – mobile only */}
        <header className="lg:hidden flex items-center gap-3 h-16 px-4 bg-surface dark:bg-surface-dark-secondary border-b border-border dark:border-border-dark shrink-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="btn-icon -ml-1"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-brand flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">ES</span>
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-white">EmailSaaS</span>
          </div>
        </header>

        {/* Page header – desktop */}
        {pageInfo.title && (
          <div className="hidden lg:flex items-center justify-between px-8 pt-8 pb-1 shrink-0">
            <div>
              <h1 className="page-title">{pageInfo.title}</h1>
              <p className="page-subtitle">{pageInfo.subtitle}</p>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
