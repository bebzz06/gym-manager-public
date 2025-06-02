import { PageHeader, IActionHeaderProps } from '@/common/PageHeader';

export const MembersHeader: React.FC<IActionHeaderProps> = ({ onAddClick }) => {
  return <PageHeader title="Members" onAddClick={onAddClick} addButtonText="Add Member" />;
};
