import React from 'react';
import { LinkStatus } from '@shared/constants/registration.link';
import { CopyToClipboardIcon } from '@/components/Icons';
import { TLinkStatus } from '@shared/types/registration.link.types';

interface IRegistrationLinkStatusIndicatorProps {
  status: TLinkStatus;
  onCopy?: () => void;
}

export const RegistrationLinkStatusIndicator: React.FC<IRegistrationLinkStatusIndicatorProps> = ({
  status,
  onCopy,
}) => {
  return (
    <div
      className={`rounded flex py-1.5 px-2.5 text-sm ${
        status === LinkStatus.ACTIVE
          ? 'font-medium bg-meta-3/[0.08] text-meta-3 cursor-pointer hover:bg-meta-3/[0.4]'
          : status === LinkStatus.EXPIRED || status === LinkStatus.EXHAUSTED
            ? 'text-primary'
            : 'text-red'
      }`}
      onClick={status === LinkStatus.ACTIVE ? onCopy : undefined}
    >
      {status === LinkStatus.ACTIVE && <CopyToClipboardIcon width="20px" height="20px" />}
      {status}
    </div>
  );
};
