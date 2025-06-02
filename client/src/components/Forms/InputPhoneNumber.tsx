import React from 'react';
import PhoneInput from 'react-phone-number-input';
import { useAppSelector } from '@/hooks/useAppSelector';

interface InputPhoneNumberProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
}

export const InputPhoneNumber: React.FC<InputPhoneNumberProps> = ({
  label,
  name,
  value,
  onChange,
  disabled = false,
  className = '',
  labelClassName = '',
}) => {
  const gymData = useAppSelector(state => state.gym);
  return (
    <div className="w-full">
      <label
        className={`mb-3 block text-sm font-medium text-black dark:text-white ${labelClassName}`}
        htmlFor={name}
      >
        {label}
      </label>
      <PhoneInput
        international
        countryCallingCodeEditable={false}
        defaultCountry={gymData?.address?.country as any}
        value={value}
        onChange={value => onChange(value || '')}
        disabled={disabled}
        className={className}
      />
    </div>
  );
};
