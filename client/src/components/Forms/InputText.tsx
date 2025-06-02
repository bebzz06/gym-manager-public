import React from 'react';

interface InputTextProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  error?: string;
  containerWidth?: string;
}

export const InputText: React.FC<InputTextProps> = ({
  label,
  name,
  id,
  value,
  onChange,
  placeholder,
  disabled = false,
  className = '',
  labelClassName = '',
  error,
  containerWidth = '',
  ...props
}) => {
  const inputId = id || name;

  const baseClasses = 'w-full rounded border-[1.5px] py-3 px-5 outline-none transition';
  const disabledClasses =
    'border-stroke bg-gray-100 text-gray-500 disabled:cursor-not-allowed dark:border-form-strokedark dark:bg-gray-700 dark:text-gray-400';
  const enabledClasses =
    'border-stroke bg-transparent text-black focus:border-primary active:border-primary dark:border-strokedark dark:text-white dark:focus:border-primary';

  const inputClasses = `${baseClasses} ${disabled ? disabledClasses : enabledClasses} ${className}`;

  return (
    <div className={`w-full sm:w-1/2 ${containerWidth}`}>
      <label
        className={`mb-3 block text-sm font-medium text-black dark:text-white ${labelClassName}`}
        htmlFor={inputId}
      >
        {label}
      </label>
      <input
        type="text"
        name={name}
        id={inputId}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={inputClasses}
        {...props}
      />
      {error && <p className="mt-1 text-danger text-sm">{error}</p>}
    </div>
  );
};
