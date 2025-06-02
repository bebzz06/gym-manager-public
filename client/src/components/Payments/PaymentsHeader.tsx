import { PageHeader, IActionHeaderProps } from '@/common/PageHeader';

export const PaymentsHeader: React.FC<IActionHeaderProps> = ({ onAddClick }) => {
  return <PageHeader title="Payments" onAddClick={onAddClick} addButtonText="Create Payment" />;
};
