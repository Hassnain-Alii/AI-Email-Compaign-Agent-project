import { useState, useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  Mail,
  Users,
  ListOrdered,
  BarChart2,
  FileText,
  Send,
  X,
  Sun,
  Moon,
  Settings,
  ChevronRight,
} from 'lucide-react';

const navSections = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { name: 'Campaigns', path: '/campaigns', icon: Send },
      { name: 'Recipients', path: '/recipients', icon: Users },
      { name: 'Lists', path: '/lists', icon: ListOrdered },
    ],
  },
  {
    label: 'Reports',
    items: [
      { name: 'Analytics', path: '/analytics', icon: BarChart2 },
      { name: 'Logs', path: '/logs', icon: FileText },
    ],
  },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 flex flex-col
          bg-surface dark:bg-surface-dark-secondary
          border-r border-border dark:border-border-dark
          transform transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-border dark:border-border-dark shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
              <Mail className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
              Email<span className="gradient-text">SaaS</span>
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="btn-icon lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {section.label}
              </p>
              <ul className="space-y-0.5">
                {section.items.map(({ name, path, icon: Icon }) => (
                  <li key={name}>
                    <NavLink
                      to={path}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        `nav-item group ${isActive ? 'nav-item-active' : ''}`
                      }
                    >
                      <Icon className="nav-icon h-4.5 w-4.5 flex-shrink-0 text-slate-400 group-[.nav-item-active]:text-brand-500 transition-colors" />
                      <span>{name}</span>
                      {location.pathname.startsWith(path) && (
                        <ChevronRight className="ml-auto h-3.5 w-3.5 text-brand-400 opacity-60" />
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-border dark:border-border-dark p-4 space-y-3 shrink-0">
          {/* Theme toggle + Settings row */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="btn-icon flex-1 justify-center"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-4.5 w-4.5" />
              ) : (
                <Moon className="h-4.5 w-4.5" />
              )}
            </button>
            <NavLink to="/profile" className={({ isActive }) => `btn-icon flex-1 justify-center ${isActive ? 'bg-brand-25 dark:bg-brand-900/30 text-brand-500' : ''}`} title="Settings">
              <Settings className="h-4.5 w-4.5" />
            </NavLink>
          </div>

          {/* User card */}
          {user && (
            <div
              onClick={logout}
              className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 group transition-colors"
              title="Sign out"
            >
              <img
                className="h-8 w-8 rounded-full ring-2 ring-border dark:ring-border-dark object-cover"
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0ea5e9&color=fff`}
                alt={user.name}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
              <span className="text-[10px] text-slate-400 group-hover:text-red-500 transition-colors font-medium">Sign out</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
