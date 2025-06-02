import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

const TermsConditions: React.FC = () => {
  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex flex-col gap-7.5 p-4 sm:p-6 xl:p-9">
        <div>
          <h3 className="mb-5 text-title-md2 font-bold text-black dark:text-white">
            Terms & Services
          </h3>

          <p className="font-medium">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec mattis quis ligula id
            molestie. Ut ultricies nulla sed mi elementum eleifend. Vivamus interdum mollis metus.
            Sed vitae orci porta, interdum nisi ac, vestibulum massa. Curabitur lorem sem,
            scelerisque ut lectus.
          </p>

          <p className="mt-4.5 font-medium">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec mattis quis ligula id
            molestie.
          </p>
        </div>

        <div>
          <h4 className="mb-5 text-title-sm2 font-bold leading-[30px] text-black dark:text-white">
            Lorem ipsum 1
          </h4>

          <p className="font-medium">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec mattis quis ligula id
            molestie. Ut ultricies nulla sed mi elementum eleifend. Vivamus interdum mollis metus.
            Sed vitae orci porta, interdum nisi ac, vestibulum massa. Curabitur lorem sem,
            scelerisque ut lectus Aliquam erat volutpat. Ut a diam ultrices, pellentesque magna
            iaculis, pellentesque lacus. Nulla at luctus ligula. Donec nibh est, elementum in
            tincidunt ac, luctus ut ipsum. In hac habitasse platea dictumst.
          </p>

          <p className="mt-4.5 font-medium">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec mattis quis ligula id
            molestie. Ut ultricies nulla sed mi elementum eleifend. Vivamus interdum mollis metus.
            Sed vitae orci porta, interdum nisi ac, vestibulum massa. Curabitur lorem sem.
          </p>

          <p className="mt-4.5 font-medium">
            Curabitur lorem sem, scelerisque ut lectus Aliquam erat volutpat. Ut a diam ultrices,
            pellentesque magna iaculis, pellentesque lacus. Nulla at luctus ligula. Donec nibh est,
            elementum in tincidunt ac, luctus ut ipsum. In hac habitasse platea dictumst Curabitur
            lorem sem, scelerisque erat volutpat.
          </p>
        </div>

        <div>
          <h4 className="mb-5 text-title-sm2 font-bold leading-[30px] text-black dark:text-white">
            Lorem ipsum 2
          </h4>

          <p className="font-medium">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec mattis quis ligula id
            molestie. Ut ultricies nulla sed mi elementum eleifend. Vivamus interdum mollis metus.
            Sed vitae orci porta, interdum nisi ac, vestibulum massa. Curabitur lorem sem.
          </p>

          <p className="mt-4.5 font-medium">
            Curabitur lorem sem, scelerisque ut lectus Aliquam erat volutpat. Ut a diam ultrices,
            pellentesque magna iaculis, pellentesque lacus. Nulla at luctus ligula. Donec nibh est,
            elementum in tincidunt ac, luctus ut ipsum. In hac habitasse platea dictumst Curabitur
            lorem sem, scelerisque erat volutpat.
          </p>
        </div>

        <div>
          <h4 className="mb-5 text-title-sm2 font-bold leading-[30px] text-black dark:text-white">
            Important Links
          </h4>

          <ul className="flex flex-col gap-2.5">
            <li className="font-medium text-primary underline">Lorem ipsum dolor sit amet,</li>
            <li className="font-medium text-primary underline">
              Curabitur lorem sem scelerisque erat volutpat.
            </li>
            <li className="font-medium text-primary underline">Scelerisque erat volutpat.</li>
            <li className="font-medium text-primary underline">elementum eleifend</li>
          </ul>
        </div>

        <div className="mt-7.5 text-center">
          <Link
            to={ROUTES.HOME}
            className="inline-flex items-center gap-2 rounded-md bg-primary py-3 px-6 font-medium text-white hover:bg-opacity-90"
          >
            <svg
              className="fill-current"
              width="16"
              height="14"
              viewBox="0 0 16 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.7492 6.38125H2.73984L7.52109 1.51562C7.77422 1.2625 7.77422 0.86875 7.52109 0.615625C7.26797 0.3625 6.87422 0.3625 6.62109 0.615625L0.799219 6.52187C0.546094 6.775 0.546094 7.16875 0.799219 7.42188L6.62109 13.3281C6.73359 13.4406 6.90234 13.525 7.07109 13.525C7.23984 13.525 7.38047 13.4687 7.52109 13.3562C7.77422 13.1031 7.77422 12.7094 7.52109 12.4563L2.76797 7.64687H14.7492C15.0867 7.64687 15.368 7.36562 15.368 7.02812C15.368 6.6625 15.0867 6.38125 14.7492 6.38125Z"
                fill=""
              />
            </svg>
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
