import { Link } from 'react-router-dom';
import { IMember } from '@/types/user.types';
import DefaultAvatar from '../../images/user/user-01.png';
import { getBeltImage, formatBeltRank } from '@/utils/belt';

interface StaffCardProps {
  adminStaff: IMember[];
  isLoading: boolean;
}

export const StaffCard = ({ adminStaff, isLoading }: StaffCardProps) => {
  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <h4 className="mb-6 px-7.5 text-xl font-semibold text-black dark:text-white">Admin Staff</h4>

      <div>
        {isLoading ? (
          <div className="flex justify-center py-4">Loading...</div>
        ) : adminStaff.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No admin staff found</div>
        ) : (
          adminStaff.map(admin => (
            <Link
              to={`/dashboard/members/${admin.id}/edit`}
              className="flex items-center gap-5 py-3 px-7.5 hover:bg-gray-3 dark:hover:bg-meta-4"
              key={admin.id}
            >
              <div className="relative h-14 w-14 rounded-full">
                <img
                  src={admin.profileImage?.url || DefaultAvatar}
                  alt={`${admin.firstName} ${admin.lastName}`}
                  className="h-full w-full rounded-full object-cover"
                />
                <span
                  className={`absolute right-0 bottom-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
                    admin.isEmailVerified ? 'bg-success' : 'bg-danger'
                  }`}
                />
              </div>

              <div className="flex flex-col flex-1 items-center justify-start sm:flex-row sm:justify-between">
                <div>
                  <h5 className="font-medium text-black dark:text-white">
                    {admin.firstName} {admin.lastName}
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{admin.email}</p>
                </div>
                {admin.rank && (
                  <div className="flex items-center gap-2">
                    <img
                      src={getBeltImage(admin.rank.belt, admin.rank.stripes)}
                      alt={formatBeltRank(admin.rank.belt, admin.rank.stripes)}
                      className="w-14 h-14"
                    />
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};
