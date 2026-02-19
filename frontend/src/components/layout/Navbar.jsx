import React, { useState } from 'react';
import { User, LogOut, ChevronDown, Sun, Moon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../utils/logout';
import { logout as logoutAction } from '../../features/auth/authSlice';
import { toggleTheme } from '../../features/theme/themeSlice';
import NotificationBell from '../common/NotificationBell';

const Navbar = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const theme = useSelector((state) => state.theme?.mode ?? 'light');
  const role = (user?.role || '').toUpperCase();
  const roleLabel = role === 'TEACHER' ? 'instructor' : (user?.role?.toLowerCase() || 'user');
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
    user?.firstName ||
    user?.email?.split('@')[0] ||
    'User';

  const handleLogout = () => {
    dispatch(logoutAction());
    logout(navigate);
  };

  const getProfilePath = () => {
    if (role === 'TEACHER') return '/teacher/profile';
    if (role === 'STUDENT') return '/student/profile';
    return '/teacher/profile';
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 fixed top-0 right-0 left-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
<div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AssignTrack
              </h1>
            </div>
          </div>
<div className="flex items-center space-x-2 sm:space-x-4">
<button
              type="button"
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
<NotificationBell />
            {role !== 'ADMIN' && (
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
<div className="relative">
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Open user menu"
                title="Open user menu"
                aria-expanded={showProfileMenu}
                aria-controls="navbar-user-menu"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {(
                      user?.firstName?.charAt(0) ||
                      user?.email?.charAt(0) ||
                      user?.role?.charAt(0) ||
                      'U'
                    ).toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {`Welcome ${displayName}`}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {roleLabel}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
{showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div
                    id="navbar-user-menu"
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20"
                  >
                    {role !== 'ADMIN' && (
                      <>
                        <button
                          onClick={() => {
                            navigate(getProfilePath());
                            setShowProfileMenu(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <User className="w-4 h-4 mr-3" />
                          Profile
                        </button>
                        <hr className="my-1 border-gray-200 dark:border-gray-700" />
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

