import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import TrafficAnalysis from './pages/TrafficAnalysis';
import CsvUpload from './pages/CsvUpload';
import DetectionResults from './pages/DetectionResults';
import ExplainabilityPage from './pages/ExplainabilityPage';
import ModelInfo from './pages/ModelInfo';
import { getHealth, getModelInfo } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const checkStatus = () => {
    getHealth()
      .then(() => setIsBackendConnected(true))
      .catch(() => setIsBackendConnected(false));

    getModelInfo()
      .then((res) => setModelInfo(res))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'analysis':
        return <TrafficAnalysis />;
      case 'csv-upload':
        return <CsvUpload />;
      case 'detections':
        return <DetectionResults />;
      case 'explainability':
        return <ExplainabilityPage />;
      case 'model-info':
        return <ModelInfo />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 relative overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setMobileSidebarOpen(false);
        }}
        isBackendConnected={isBackendConnected}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <Navbar
          activeTab={activeTab}
          onRefresh={checkStatus}
          modelInfo={modelInfo}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
}

export default App;
