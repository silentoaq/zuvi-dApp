import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { PropertiesPage } from './pages/PropertiesPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { ContractsPage } from './pages/ContractsPage';
import { ListingsPage } from './pages/ListingsPage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="properties" element={<PropertiesPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="contracts" element={<ContractsPage />} />
        <Route path="listings" element={<ListingsPage />} />
      </Route>
    </Routes>
  );
};

export default App;