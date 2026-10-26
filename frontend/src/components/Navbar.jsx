import React from 'react';
import { Cpu, RefreshCw, Menu } from 'lucide-react';

const Navbar = ({ activeTab, onRefresh, modelInfo, onOpenMobileSidebar }) => {
  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-3.5 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={onOpenMobileSidebar}
          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg md:hidden transition-colors border border-slate-700/60"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h2 className="text-sm sm:text-lg font-semibold text-slate-100 capitalize truncate max-w-[150px] sm:max-w-none">
          {activeTab.replace('-', ' ')}
        </h2>
        <span className="hidden sm:inline-flex text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-mono">
          XAI Hybrid Framework
        </span>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Model Status Badge */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 bg-slate-950 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-slate-800 text-xs">
          <Cpu className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="hidden md:inline text-slate-400 font-mono">Model:</span>
          {modelInfo?.is_trained ? (
            <span className="text-emerald-400 font-semibold font-mono text-[11px] sm:text-xs">
              <span className="hidden sm:inline">Active </span>(100%)
            </span>
          ) : (
            <span className="text-amber-400 font-semibold font-mono text-[11px] sm:text-xs">Pending</span>
          )}
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 shrink-0"
          title="Refresh Data"
        >
          <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Real-time Indicator */}
        <div className="hidden xs:flex items-center space-x-1.5 bg-indigo-950/40 text-indigo-300 border border-indigo-800/40 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          <span className="hidden sm:inline text-[11px]">SHAP Active</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
