import { useState, useEffect, useRef } from 'react';
import { searchMembers } from '@/http/Member';
import { IMember } from '@/types/user.types';
import { InputText } from '@/components/Forms';
import { TUserRole } from '@shared/types/user.types';

interface MemberSearchInputProps {
  label?: string;
  onChange: (memberId: string, memberName: string, memberRole: TUserRole) => void;
  error?: string;
  value?: string;
  searchRoleOptions?: TUserRole[];
}

export const MemberSearchInput: React.FC<MemberSearchInputProps> = ({
  label = 'Search Member',
  onChange,
  error,
  value,
  searchRoleOptions,
}) => {
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [members, setMembers] = useState<IMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Add this effect to sync with parent value
  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search effect
  useEffect(() => {
    const searchMembersDebounced = async () => {
      if (searchTerm.length < 2) {
        setMembers([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await searchMembers(searchTerm, searchRoleOptions);
        setMembers(results);
        // Only show dropdown if we're actively searching (not after selection)
        if (searchTerm !== results[0]?.firstName + ' ' + results[0]?.lastName) {
          setShowDropdown(true);
        }
      } catch (error) {
        console.error('Error searching members:', error);
        setMembers([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchMembersDebounced, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSelectMember = (member: IMember) => {
    const fullName = `${member.firstName} ${member.lastName}`;
    setSearchTerm(fullName);
    onChange(member.id, fullName, member.role);
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <InputText
        label={label}
        name="memberSearch"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder="Search member by name"
        error={error}
        containerWidth="sm:w-3/4"
      />

      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-boxdark border border-stroke dark:border-strokedark rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
          ) : members.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              {searchTerm.length < 2 ? 'Type to search...' : 'No members found'}
            </div>
          ) : (
            members.map(member => (
              <div
                key={member.id}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-meta-4 cursor-pointer text-sm"
                onClick={() => handleSelectMember(member)}
              >
                <div className="font-medium text-black dark:text-white">
                  {member.firstName} {member.lastName}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{member.email}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
