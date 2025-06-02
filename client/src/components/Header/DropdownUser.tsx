import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '@/http/Auth';
import { clearProfileData } from '@/store/slices/profileSlice';
import { logoutStart, logoutSuccess, logoutFailure } from '@/store/slices/authSlice';
import { clearGymData } from '@/store/slices/gymSlice';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useMenuAccess } from '@/hooks/useMenuAccess';
import defaultGymLogo from '@/images/gym/default-gym-logo.jpg';
import { ROUTES, dropdownMenuItems } from '@/constants';

export const DropdownUser = () => {
  const profileData = useAppSelector(state => state.profile);
  const { firstName, lastName, email } = profileData;
  const gymData = useAppSelector(state => state.gym);
  const { logo } = gymData;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { canAccessMenuItem } = useMenuAccess();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const trigger = useRef<any>(null);
  const dropdown = useRef<any>(null);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!dropdown.current) return;
      if (!dropdownOpen || dropdown.current.contains(target) || trigger.current.contains(target))
        return;
      setDropdownOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  const handleLogout = async () => {
    dispatch(logoutStart());
    try {
      await logout();
      dispatch(clearProfileData());
      dispatch(clearGymData());
      navigate(ROUTES.SIGNIN, { replace: true });
    } catch (error) {
      dispatch(logoutFailure(error as string));
      console.error('Logout failed:', error);
    } finally {
      dispatch(logoutSuccess());
    }
  };

  // Add this function to handle navigation clicks
  const handleNavigation = () => {
    setDropdownOpen(false); // Close dropdown when navigating
  };

  return (
    <div className="relative">
      <Link
        ref={trigger}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-4"
        to="#"
      >
        <span className="hidden text-right lg:block">
          <span className="block text-sm font-medium text-black dark:text-white">
            {firstName} {lastName}
          </span>
          <span className="block text-xs">{email}</span>
        </span>

        <span className="h-14 w-14 rounded-full overflow-hidden">
          <img
            src={logo?.url || defaultGymLogo}
            alt={logo?.url ? 'Gym Logo' : 'Default Logo'}
            className="h-full w-full object-cover"
          />
        </span>

        <svg
          className="hidden fill-current sm:block"
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.410765 0.910734C0.736202 0.585297 1.26384 0.585297 1.58928 0.910734L6.00002 5.32148L10.4108 0.910734C10.7362 0.585297 11.2638 0.585297 11.5893 0.910734C11.9147 1.23617 11.9147 1.76381 11.5893 2.08924L6.58928 7.08924C6.26384 7.41468 5.7362 7.41468 5.41077 7.08924L0.410765 2.08924C0.0853277 1.76381 0.0853277 1.23617 0.410765 0.910734Z"
            fill=""
          />
        </svg>
      </Link>

      <div
        ref={dropdown}
        onFocus={() => setDropdownOpen(true)}
        onBlur={() => setDropdownOpen(false)}
        className={`absolute right-0 mt-4 flex w-62.5 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark ${
          dropdownOpen === true ? 'block' : 'hidden'
        }`}
      >
        <ul className="flex flex-col gap-5 border-b border-stroke px-6 py-7.5 dark:border-strokedark">
          {dropdownMenuItems.map(
            (item, index) =>
              canAccessMenuItem(item.access) && (
                <li key={index}>
                  {item.title === 'Logout' ? (
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
                    >
                      {item.icon}
                      {item.title}
                    </button>
                  ) : (
                    <Link
                      to={item.path}
                      onClick={handleNavigation}
                      className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
                    >
                      {item.icon}
                      {item.title}
                    </Link>
                  )}
                </li>
              )
          )}
        </ul>
      </div>
    </div>
  );
};
