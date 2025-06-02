import React, { useState } from 'react';

interface TabItem {
  label: string;
  content: React.ReactNode;
}

interface TabProps {
  tabs: TabItem[];
  defaultTab?: number;
}

export const Tab: React.FC<TabProps> = ({ tabs, defaultTab = 0 }) => {
  const [openTab, setOpenTab] = useState(defaultTab);

  const activeClasses = 'text-primary border-primary';
  const inactiveClasses = 'border-transparent';

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="mb-6 flex flex-wrap gap-5 border-b border-stroke dark:border-strokedark sm:gap-10 px-7.5 pt-7.5">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`border-b-2 py-4 text-sm font-medium hover:text-primary md:text-base ${
              openTab === index ? activeClasses : inactiveClasses
            }`}
            onClick={() => setOpenTab(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-7.5">
        {tabs.map((tab, index) => (
          <div key={index} className={`${openTab === index ? 'block' : 'hidden'}`}>
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};
