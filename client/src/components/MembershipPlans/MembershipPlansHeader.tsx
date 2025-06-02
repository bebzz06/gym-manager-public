import { PageHeader, IActionHeaderProps } from '@/common/PageHeader';
import { useAppSelector } from '@/hooks/useAppSelector';
import { UserRole, UserRoleAccess } from '@shared/constants/user';

export const MembershipPlansHeader: React.FC<IActionHeaderProps> = ({ onAddClick }) => {
  const { role } = useAppSelector(state => state.profile);
  const canAddPlan = role ? UserRoleAccess[UserRole.ADMIN].includes(role) : false;

  return (
    <PageHeader
      title="Membership Plans"
      onAddClick={onAddClick}
      addButtonText="Add Plan"
      showAddButton={canAddPlan}
    />
  );
};
