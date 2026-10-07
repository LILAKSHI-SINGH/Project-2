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
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBackendConnected={isBackendConnected}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          activeTab={activeTab}
          onRefresh={checkStatus}
          modelInfo={modelInfo}
        />

        <main className="flex-1 overflow-y-auto">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
}

export default App;
