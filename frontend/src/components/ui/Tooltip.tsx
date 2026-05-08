import React, { useState } from 'react';

interface TooltipProps {
  text: React.ReactNode;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [isTooltipVisible, setTooltipVisible] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setTooltipVisible(true)}
      onMouseLeave={() => setTooltipVisible(false)}
    >
      {children}
      {isTooltipVisible && (
        <div className="absolute bottom-full mb-2 w-64 p-3 bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg shadow-lg z-10 transition-opacity duration-300">
          {text}
        </div>
      )}
    </div>
  );
};
