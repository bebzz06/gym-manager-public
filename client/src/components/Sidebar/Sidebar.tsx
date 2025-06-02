import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Logo from '@/images/logo/output-onlinepngtools.png';
import { SidebarLinkGroup } from '@/components/Sidebar/SidebarLinkGroup';
import { menuItems } from '@/constants';
import { BackArrow, ChevronDown } from '@/components/Icons';
import { ISidebarProps } from '@/types/sidebar.types';
import { useMenuAccess } from '@/hooks/useMenuAccess';
import { useAppSelector } from '@/hooks/useAppSelector';

export const Sidebar = ({ sidebarOpen, setSidebarOpen }: ISidebarProps) => {
  const location = useLocation();
  const { pathname } = location;
  const { canAccessMenuItem } = useMenuAccess();
  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);
  const { loading } = useAppSelector(state => state.auth);

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true'
  );

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target))
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);
  if (loading) return null;
  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* <!-- SIDEBAR HEADER --> */}
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <NavLink to="/" className="flex items-center gap-2 sm:gap-1">
          <img src={Logo} alt="Logo" className="w-18 h-18 sm:w-14 sm:h-14" />
          <h2 className="text-white text-2xl mt-1 font-bold text-left sm:text-center sm:mt-4">
            Dojo Manager
          </h2>
        </NavLink>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
        >
          <BackArrow />
        </button>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        {/* <!-- Sidebar Menu --> */}
        <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
          {menuItems.map((group, groupIndex) => {
            // Filter items based on access permissions
            const accessibleItems = group.items.filter(
              item =>
                // If the item has a menuAccess property, check permissions
                !item.access || canAccessMenuItem(item.access)
            );

            // Only render group if it has accessible items
            if (accessibleItems.length === 0) return null;

            return (
              <div key={groupIndex}>
                <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">{group.title}</h3>

                <ul className="mb-6 flex flex-col gap-1.5">
                  {accessibleItems.map((item, itemIndex) => (
                    <SidebarLinkGroup key={itemIndex} activeCondition={pathname === item.path}>
                      {(handleClick, open) => (
                        <React.Fragment>
                          <NavLink
                            to={item.submenu ? '#' : item.path}
                            className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                              pathname === item.path && 'bg-graydark dark:bg-meta-4'
                            }`}
                            onClick={e => {
                              if (item.submenu) {
                                e.preventDefault();
                                sidebarExpanded ? handleClick() : setSidebarExpanded(true);
                              } else {
                                // Close sidebar when clicking on a direct navigation link
                                setSidebarOpen(false);
                              }
                            }}
                          >
                            {item.icon}
                            {item.title}
                            {item.submenu && (
                              <ChevronDown
                                className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${
                                  open && 'rotate-180'
                                }`}
                              />
                            )}
                          </NavLink>

                          {/* Submenu */}
                          {item.submenu && (
                            <div
                              className={`translate transform overflow-hidden ${!open && 'hidden'}`}
                            >
                              <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                                {item.submenu.map((subitem, subIndex) => (
                                  <li key={subIndex}>
                                    <NavLink
                                      to={subitem.path}
                                      className={({ isActive }) =>
                                        'group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ' +
                                        (isActive && '!text-white')
                                      }
                                      onClick={() => setSidebarOpen(false)}
                                    >
                                      {subitem.title}
                                      {subitem.badge && (
                                        <span className="absolute right-4 block rounded bg-primary py-1 px-2 text-xs font-medium text-white">
                                          {subitem.badge.text}
                                        </span>
                                      )}
                                    </NavLink>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </React.Fragment>
                      )}
                    </SidebarLinkGroup>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
