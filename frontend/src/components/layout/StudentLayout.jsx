import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Home,
  BookOpen,
  FileText,
  LogOut,
  Menu,
  X,
  User,
  Sun,
  Moon,
} from 'lucide-react';
import { logout } from '../../utils/logout';
import { toggleTheme } from '../../features/theme/themeSlice';
import NotificationBell from '../common/NotificationBell';

const StudentLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const theme = useSelector((state) => state.theme?.mode ?? 'light');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
    user?.firstName ||
    user?.email?.split('@')[0] ||
    'Student';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/student/dashboard' },
    { icon: BookOpen, label: 'My Batches', path: '/student/batches' },
    { icon: FileText, label: 'Assignments', path: '/student/assignments' },
    { icon: User, label: 'Profile', path: '/student/profile' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
<nav className="bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
<div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
                title={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={sidebarOpen}
                aria-controls="student-mobile-sidebar"
              >
                {sidebarOpen ? (
                  <X className="w-6 h-6 text-slate-700 dark:text-gray-300" />
                ) : (
                  <Menu className="w-6 h-6 text-slate-700 dark:text-gray-300" />
                )}
              </button>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">AssignTrack</h1>
            </div>
<div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-slate-900 dark:bg-slate-700 text-white'
                        : 'text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
<div className="flex items-center space-x-2 sm:space-x-4">
              <button
                type="button"
                onClick={() => dispatch(toggleTheme())}
                className="p-2 rounded-md text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <NotificationBell />
              <div className="hidden md:block">
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900 dark:text-gray-100">
                      {`Welcome ${displayName}`}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-gray-400">Student</p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-slate-900 dark:bg-slate-700 flex items-center justify-center">
                    <span className="text-white font-bold">
                      {(
                        user?.firstName?.charAt(0) ||
                        user?.email?.charAt(0) ||
                        user?.role?.charAt(0) ||
                        'S'
                      ).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-300 transition-colors"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>
{sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 pt-16">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div
            id="student-mobile-sidebar"
            className="absolute left-0 top-16 bottom-0 w-64 bg-white dark:bg-gray-900 shadow-lg"
          >
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-slate-900 dark:bg-slate-700 text-white'
                        : 'text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}
<main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-gray-950">{children}</main>
    </div>
  );
};

export default StudentLayout;
