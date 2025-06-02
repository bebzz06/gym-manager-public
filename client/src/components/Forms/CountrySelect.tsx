import React, { useMemo } from 'react';
import countryList from 'react-select-country-list';
import { SelectGroup } from '@/components/Forms';
import { MULTI_TIMEZONE_COUNTRIES } from '@shared/constants/countries';

interface CountrySelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  label?: string;
  name?: string;
  id?: string;
  disabled?: boolean;
  containerWidth?: string;
  placeholder?: string;
}

export const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onChange,
  label = 'Country',
  name = 'country',
  id,
  disabled,
  containerWidth = 'sm:w-full',
  placeholder = 'Select a country',
}) => {
  const options = useMemo(() => {
    return countryList()
      .getData()
      .filter(country => !MULTI_TIMEZONE_COUNTRIES.includes(country.value))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  return (
    <SelectGroup
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      name={name}
      id={id}
      disabled={disabled}
      containerWidth={containerWidth}
      placeholder={placeholder}
    />
  );
};

export default CountrySelect;
