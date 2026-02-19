import React from 'react';
import Layout from '../../components/layout/Layout';

const Placeholder = ({ title, description }) => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {description || 'This section is not available yet.'}
        </p>
      </div>
    </Layout>
  );
};

export default Placeholder;
