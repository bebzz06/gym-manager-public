import { Tab } from '@/common/Tab';
import { GymInformationForm } from '@/components/Forms/GymInformationForm';
import { StaffCard } from '@/components/Settings/StaffCard';
import { MembersIcon } from '@/components/Icons';
import { useState, useEffect } from 'react';
import { ChangeRoleModal } from '@/components/Settings/ChangeRoleModal';
import { getMembers } from '@/http/Member';
import { IMember } from '@/types/user.types';
import { UserRole } from '@shared/constants/user';

const Settings = () => {
  const [popupOpen, setPopupOpen] = useState(false);
  const [adminStaff, setAdminStaff] = useState<IMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fetchAdminStaff = async () => {
    try {
      setIsLoading(true);
      const members = await getMembers([UserRole.OWNER, UserRole.ADMIN]);
      setAdminStaff(members);
    } catch (error) {
      console.error('Error fetching admin staff:', error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchAdminStaff();
  }, []);

  const tabs = [
    {
      label: 'Gym Information',
      content: <GymInformationForm />,
    },
    {
      label: 'User Management',
      content: (
        <div className="flex flex-col gap-4">
          <button
            className="w-fit inline-flex items-center justify-center rounded-md bg-primary py-2 px-6 text-center font-medium text-white hover:bg-opacity-90"
            onClick={() => setPopupOpen(true)}
          >
            <MembersIcon className="fill-current mr-2" />
            Change Roles
          </button>
          <StaffCard adminStaff={adminStaff} isLoading={isLoading} />
        </div>
      ),
    },
  ];

  return (
    <div className="container">
      <Tab tabs={tabs} />
      <ChangeRoleModal
        popupOpen={popupOpen}
        setPopupOpen={setPopupOpen}
        onRoleChange={fetchAdminStaff}
      />
    </div>
  );
};

export default Settings;
