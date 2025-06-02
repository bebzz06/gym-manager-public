import React from 'react';

const InvalidLink: React.FC = () => {
  return (
    <div className="min-h-screen rounded-sm border border-stroke bg-white px-5 py-10 shadow-default dark:border-strokedark dark:bg-boxdark sm:py-20">
      <div className="mx-auto max-w-[490px]">
        <div className="mt-7.5 text-center">
          <h2 className="mb-3 text-2xl font-bold text-black dark:text-white">
            Invalid Registration Link
          </h2>
          <p className="font-medium text-body-color">
            This registration link is invalid. Please contact your gym administrator for a new
            registration link.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvalidLink;
