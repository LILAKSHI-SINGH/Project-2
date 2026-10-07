import React from 'react';

const RiskGauge = ({ score = 0, level = 'Low Risk', isZeroDay = false }) => {
  const normalizedScore = Math.min(100, Math.max(0, score));

  // Determine stroke color based on risk score and zero-day status
  let strokeColor = '#10b981'; // Green
  let textColor = 'text-emerald-400';
  let badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

  if (isZeroDay) {
    strokeColor = '#a855f7'; // Purple
    textColor = 'text-purple-400';
    badgeBg = 'bg-purple-500/10 text-purple-400 border-purple-500/40 glow-purple';
  } else if (normalizedScore > 80) {
    strokeColor = '#ef4444'; // Red
    textColor = 'text-rose-500';
    badgeBg = 'bg-rose-500/10 text-rose-400 border-rose-500/30 glow-red';
  } else if (normalizedScore > 60) {
    strokeColor = '#f97316'; // Orange
    textColor = 'text-orange-400';
    badgeBg = 'bg-orange-500/10 text-orange-400 border-orange-500/30';
  } else if (normalizedScore > 30) {
    strokeColor = '#f59e0b'; // Yellow
    textColor = 'text-amber-400';
    badgeBg = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  }

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
          {/* Background circle */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            className="stroke-slate-800"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke={strokeColor}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-extrabold font-mono ${textColor}`}>
            {normalizedScore.toFixed(0)}%
          </span>
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
            Risk Score
          </span>
        </div>
      </div>

      <div className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold border ${badgeBg}`}>
        {isZeroDay ? 'Potential Zero-Day' : level}
      </div>
    </div>
  );
};

export default RiskGauge;
