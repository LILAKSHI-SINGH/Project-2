import React from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  UploadCloud, 
  ShieldAlert, 
  BrainCircuit, 
  Cpu, 
  Terminal,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, isBackendConnected }) => {
  const menuItems = [
    { id: 'dashboard', label: 'SOC Dashboard', icon: LayoutDashboard },
    { id: 'analysis', label: 'Traffic Analysis', icon: Activity },
    { id: 'csv-upload', label: 'CSV Bulk Upload', icon: UploadCloud },
    { id: 'detections', label: 'Detection History', icon: ShieldAlert },
    { id: 'explainability', label: 'Explainable AI (XAI)', icon: BrainCircuit },
    { id: 'model-info', label: 'Model Metrics', icon: Cpu },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
          <div className="p-2 bg-indigo-600/20 border border-indigo-500/40 rounded-lg text-indigo-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-sm tracking-wide leading-snug">ZeroDay-XAI</h1>
            <p className="text-[11px] text-slate-400 font-mono">SOC Anomaly Shield</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Connection & Status Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">Backend Status:</span>
          {isBackendConnected ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle className="w-3 h-3 mr-1" /> Connected
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <AlertTriangle className="w-3 h-3 mr-1" /> Disconnected
            </span>
          )}
        </div>
        <div className="mt-3 text-[11px] text-slate-500 text-center font-mono">
          B.Tech CS Final Project
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
