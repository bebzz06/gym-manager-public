import React from 'react';

interface SelectGroupProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  value: string;
  name: string;
  id?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  containerWidth?: string;
}

export const SelectGroup: React.FC<SelectGroupProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  name,
  id,
  disabled = false,
  containerWidth = '',
  ...props
}) => {
  const baseClasses =
    'relative z-20 w-full appearance-none rounded border py-3 pr-10 pl-5 outline-none transition';
  const disabledClasses =
    'border-stroke bg-gray-100 text-gray-500 disabled:cursor-not-allowed dark:border-form-strokedark dark:bg-gray-700 dark:text-gray-400';
  const enabledClasses =
    'border-stroke bg-transparent text-black focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary';

  const selectClasses = `${baseClasses} ${disabled ? disabledClasses : enabledClasses}`;

  return (
    <div className={`mb-4.5 w-full sm:w-1/2 ${containerWidth}`}>
      <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">{label}</label>

      <div className="relative z-20 bg-transparent dark:bg-form-input">
        <select
          name={name}
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={selectClasses}
          {...props}
        >
          <option value="" disabled className="text-body dark:text-bodydark">
            {placeholder}
          </option>
          {options.map(option => (
            <option
              key={option.value}
              value={option.value}
              className="text-body dark:text-bodydark truncate"
            >
              {option.label}
            </option>
          ))}
        </select>

        <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2 pointer-events-none">
          <svg
            className={`fill-current ${disabled ? 'opacity-0' : ''}`}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g opacity="0.8">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                fill=""
              ></path>
            </g>
          </svg>
        </span>
      </div>
    </div>
  );
};
