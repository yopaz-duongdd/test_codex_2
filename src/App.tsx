import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TestAutomationAPI } from './utils/api';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Screens from './pages/Screens';
import TestScripts from './pages/TestScripts';
import Tags from './pages/Tags';
import TestResults from './pages/TestResults';

// Initialize sample data
TestAutomationAPI.initializeSampleData();

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/screens" element={<Screens />} />
            <Route path="/test-scripts" element={<TestScripts />} />
            <Route path="/tags" element={<Tags />} />
            <Route path="/results" element={<TestResults />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;