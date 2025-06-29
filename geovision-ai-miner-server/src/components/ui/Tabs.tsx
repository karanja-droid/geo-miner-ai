// @ts-ignore
import React, { useState } from 'react';

interface Tab {
  label: string;
  content: React.ReactNode;
  key: string;
}

interface TabsProps {
  tabs: Tab[];
  initialTab?: string;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, initialTab, className = '' }) => {
  const [active, setActive] = useState(initialTab || tabs[0]?.key);

  return (
    <div className={className}>
      <div className="flex border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 -mb-px font-medium text-sm border-b-2 transition-colors duration-200 focus:outline-none ${active === tab.key ? 'border-mining-primary text-mining-primary' : 'border-transparent text-gray-500 hover:text-mining-primary'}`}
            onClick={() => setActive(tab.key)}
            tabIndex={0}
            aria-selected={active === tab.key}
            aria-controls={`tab-panel-${tab.key}`}
            role="tab"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4" role="tabpanel" id={`tab-panel-${active}`}> 
        {tabs.find(tab => tab.key === active)?.content}
      </div>
    </div>
  );
}; 