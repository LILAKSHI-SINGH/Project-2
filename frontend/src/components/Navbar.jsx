import React from 'react';
import { Cpu, Bell, Activity, RefreshCw } from 'lucide-react';

const Navbar = ({ activeTab, onRefresh, isTraining, modelInfo }) => {
  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center space-x-3">
        <h2 className="text-lg font-semibold text-slate-100 capitalize">
          {activeTab.replace('-', ' ')}
        </h2>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
          XAI Hybrid Framework
        </span>
      </div>

      <div className="flex items-center space-x-4">
        {/* Model Status Badge */}
        <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-400 font-mono">Model:</span>
          {modelInfo?.is_trained ? (
            <span className="text-emerald-400 font-semibold font-mono">Active (100% Acc)</span>
          ) : (
            <span className="text-amber-400 font-semibold font-mono">Not Trained</span>
          )}
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          className="p-2 text-slate-400 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Real-time Indicator */}
        <div className="flex items-center space-x-2 bg-indigo-950/40 text-indigo-300 border border-indigo-800/40 px-3 py-1.5 rounded-lg text-xs font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          <span>SHAP Active</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
