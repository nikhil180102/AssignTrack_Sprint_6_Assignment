import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <Sidebar />
      <main className="ml-64 mt-16 p-8 bg-gray-50 dark:bg-gray-950">
        {children}
      </main>
    </div>
  );
};

export default Layout;