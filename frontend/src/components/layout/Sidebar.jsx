
import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Users,
  BarChart3,
} from 'lucide-react';
import { getRole } from '../../utils/auth';

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const role = (user?.role || getRole() || 'TEACHER').toUpperCase();
  const panelLabel = role === 'TEACHER' ? 'INSTRUCTOR' : role;

  const menuItems = useMemo(() => {
    if (role === 'ADMIN') {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
      ];
    }
    if (role === 'STUDENT') {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
      ];
    }
    return [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/teacher/dashboard' },
      { icon: BookOpen, label: 'My Batches', path: '/teacher/batches' },
      { icon: FileText, label: 'Assignments', path: '/teacher/assignments' },
      { icon: Users, label: 'Submissions', path: '/teacher/submissions' },
    ];
  }, [role]);

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <div className="px-5 pt-6 pb-3">
        <div className="text-xs font-semibold tracking-widest text-gray-400 dark:text-gray-500">
          {panelLabel} PANEL
        </div>
      </div>
      <nav className="px-3 pb-6 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`
            }
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                role === 'ADMIN'
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              } group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400`}
            >
              <item.icon className="w-5 h-5" />
            </div>
            <span className="font-semibold">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

