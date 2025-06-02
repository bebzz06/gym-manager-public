import { PlusIcon } from '@/components/Icons';

interface IPageHeaderProps {
  title: string;
  onAddClick: () => void;
  addButtonText: string;
  showAddButton?: boolean;
}
export interface IActionHeaderProps {
  onAddClick: () => void;
}

export const PageHeader: React.FC<IPageHeaderProps> = ({
  title,
  onAddClick,
  addButtonText,
  showAddButton = true,
}) => {
  return (
    <div className="mb-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <h2 className="text-title-md2 font-semibold text-black dark:text-white">{title}</h2>
      {showAddButton && (
        <button
          className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-6 text-center font-medium text-white hover:bg-opacity-90"
          onClick={onAddClick}
        >
          <PlusIcon className="fill-current mr-2" />
          {addButtonText}
        </button>
      )}
    </div>
  );
};
