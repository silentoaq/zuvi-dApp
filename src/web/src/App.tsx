import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layouts/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
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
        
        {/* 公開頁面 - 任何人都可以訪問 */}
        <Route path="properties" element={<PropertiesPage />} />
        
        {/* 需要自然人憑證 */}
        <Route 
          path="applications" 
          element={
            <ProtectedRoute requireCitizen>
              <ApplicationsPage />
            </ProtectedRoute>
          } 
        />
        
        {/* 需要自然人憑證 */}
        <Route 
          path="contracts" 
          element={
            <ProtectedRoute requireCitizen>
              <ContractsPage />
            </ProtectedRoute>
          } 
        />
        
        {/* 需要產權憑證 */}
        <Route 
          path="listings" 
          element={
            <ProtectedRoute requireProperty>
              <ListingsPage />
            </ProtectedRoute>
          } 
        />
      </Route>
    </Routes>
  );
};

export default App;