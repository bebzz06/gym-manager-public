import React from 'react';

interface SelectOptionProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  disabled?: boolean;
}

export const SelectOption: React.FC<SelectOptionProps> = ({
  label,
  options,
  value,
  name,
  onChange,
  id,
  disabled = false,
  ...props
}) => {
  const baseClasses = 'sr-only';
  const spanBaseClasses = 'flex h-5 w-5 items-center justify-center rounded-full border';
  const spanDisabledClasses =
    'border-gray-300 bg-gray-100 cursor-not-allowed dark:border-gray-600 dark:bg-gray-700';

  return (
    <div className="mb-5.5">
      <label className="mb-4.5 block text-sm font-medium text-black dark:text-white">{label}</label>

      <div className="flex flex-wrap items-center gap-5.5">
        {options.map(option => {
          const spanEnabledClasses = value === option.value ? 'border-primary' : 'border-body';
          return (
            <div key={option.value}>
              <label
                className={`relative flex cursor-pointer select-none items-center gap-2 text-sm font-medium ${
                  disabled ? 'text-gray-500 dark:text-gray-400' : 'text-black dark:text-white'
                }`}
              >
                <input
                  className={baseClasses}
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={onChange}
                  id={id}
                  disabled={disabled}
                  {...props}
                />
                <span
                  className={`${spanBaseClasses} ${
                    disabled ? spanDisabledClasses : spanEnabledClasses
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full bg-primary ${
                      value === option.value ? 'flex' : 'hidden'
                    } ${disabled ? 'opacity-50' : ''}`}
                  ></span>
                </span>
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};
