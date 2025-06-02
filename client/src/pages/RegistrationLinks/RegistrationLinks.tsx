import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { formatDateAndTimeForDisplay } from '@/utils/date';
import {
  expireRegistrationLink,
  generateRegistrationLink,
  revokeRegistrationLink,
} from '@/http/RegistrationLink';
import toast from 'react-hot-toast';
import { CalendarIcon } from '@/components/Icons';
import { LinkStatus } from '@shared/constants/registration.link';
import { useRegistrationLinks } from '@/hooks/useRegistrationLinks';
import { ConfirmDialog, FetchLoader, Tooltip } from '@/common';
import { CountdownTimer } from '@/components/RegistrationLinks/CountdownTimer';
import { RegistrationLinkStatusIndicator } from '@/components/RegistrationLinks/RegistrationLinkStatusIndicator';

const RegistrationLinks: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const {
    registrationLinks,
    loading: loadingLinks,
    fetchRegistrationLinks,
  } = useRegistrationLinks();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState<boolean>(false);
  const [linkIdToRevoke, setLinkIdToRevoke] = useState<string | null>(null);

  const haveActiveLink = registrationLinks.some(link => link.status === LinkStatus.ACTIVE);
  const registrationAccessLink = Cookies.get('registrationUrl');
  const copyToClipboard = () => {
    if (!registrationAccessLink) {
      toast.error('No registration link found');
      return;
    }
    navigator.clipboard.writeText(registrationAccessLink);
    toast.success(`Link: ${registrationAccessLink} copied to clipboard`);
  };

  //Generate a new link
  const handleGenerateLink = async () => {
    try {
      setLoading(true);
      await generateRegistrationLink();
      await fetchRegistrationLinks();
    } catch (error: any) {
      toast.error(error.message || 'Error generating registration link');
    } finally {
      setLoading(false);
    }
  };
  const handleGenerateLinkClick = () => {
    setIsConfirmDialogOpen(true);
  };
  const handleConfirmGenerateLink = async () => {
    setIsConfirmDialogOpen(false);
    await handleGenerateLink();
  };

  //Revoke a link
  const handleRevokeLink = async (linkId: string) => {
    try {
      const response = await revokeRegistrationLink(linkId);
      if (response.success) {
        toast.success(response.message);
        fetchRegistrationLinks(); // Refresh the list of links
      } else {
        toast.error(response.message || 'Error revoking registration link');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error revoking registration link');
    }
  };

  const handleRevokeLinkClick = (linkId: string) => {
    setLinkIdToRevoke(linkId);
    setIsRevokeDialogOpen(true);
  };

  const handleConfirmRevokeLink = async () => {
    if (linkIdToRevoke) {
      await handleRevokeLink(linkIdToRevoke);
      setLinkIdToRevoke(null);
    }
    setIsRevokeDialogOpen(false);
  };
  //Expire a link
  const handleCountDownExpiration = async (linkId: string) => {
    setLoading(true);
    try {
      await expireRegistrationLink(linkId);
      fetchRegistrationLinks();
    } catch (error) {
      toast.error('Error expiring registration link');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrationLinks();
  }, []);
  return (
    <div className="col-span-12 xl:col-span-7">
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-4 py-4 dark:border-strokedark md:px-6 md:py-6 xl:px-7.5">
          <div className="flex flex-col items-center sm:flex-row sm:justify-between">
            <div>
              <h2 className="text-title-sm2 font-bold text-black dark:text-white">
                Registration Links
              </h2>
            </div>
            {!haveActiveLink && (
              <button
                onClick={handleGenerateLinkClick}
                disabled={loading}
                className=" mt-4 sm:mt-0 inline-flex items-center justify-center rounded-md bg-primary py-2 px-4 font-medium text-white hover:bg-opacity-90"
              >
                {loading ? 'Generating...' : 'Generate New Link'}
              </button>
            )}
          </div>
        </div>

        <div className="px-4 py-4 md:px-6 md:py-6 xl:px-7.5">
          {loadingLinks ? (
            <FetchLoader />
          ) : (
            <div className="flex flex-col gap-6">
              {registrationLinks.length === 0 ? (
                <div className="text-center text-gray-500">No links found.</div>
              ) : (
                registrationLinks.map((registrationLink, id) => {
                  return (
                    <div className="flex items-center justify-between " key={id}>
                      <div className="flex flex-grow items-center gap-4.5">
                        <div>
                          <h4 className="mb-2 font-medium text-black dark:text-white">
                            Creator: {registrationLink.createdBy.firstName}{' '}
                            {registrationLink.createdBy.lastName}
                          </h4>

                          {registrationLink.status === LinkStatus.ACTIVE ? (
                            <CountdownTimer
                              targetDate={registrationLink.expiresAt}
                              className="flex h-8 min-w-[24px] items-center justify-center rounded-lg bg-black px-1 text-lg font-black leading-[1.2] text-white dark:bg-boxdark lg:text-xl xl:text-[16px]"
                              onExpire={() => handleCountDownExpiration(registrationLink.id)}
                              endMessage="The link has expired."
                            />
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <CalendarIcon width="16px" height="16px" />
                              <span className="text-xs font-medium">
                                {formatDateAndTimeForDisplay(registrationLink.createdAt)}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                      {!loading && (
                        <div className="flex flex-col gap-6">
                          {registrationLink.status === LinkStatus.REVOKED ? (
                            <Tooltip
                              message={`Revoked on ${formatDateAndTimeForDisplay(registrationLink.revokedAt as string)} by ${registrationLink.revokedBy?.firstName} ${registrationLink.revokedBy?.lastName}`}
                            >
                              <RegistrationLinkStatusIndicator status={registrationLink.status} />
                            </Tooltip>
                          ) : (
                            <RegistrationLinkStatusIndicator
                              status={registrationLink.status}
                              onCopy={
                                registrationLink.status === LinkStatus.ACTIVE
                                  ? () => copyToClipboard()
                                  : undefined
                              }
                            />
                          )}

                          {/* revoke link button */}
                          {registrationLink.status === LinkStatus.ACTIVE && (
                            <button
                              className="rounded flex py-1.5 px-2.5 text-sm text-center bg-red/[0.08] text-red hover:bg-red/[0.4]"
                              onClick={() => handleRevokeLinkClick(registrationLink.id)}
                            >
                              Revoke Link
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        title="Generate New Link"
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={handleConfirmGenerateLink}
        message="Are you sure you want to generate a new registration link?"
        confirmText="Generate"
        cancelText="Cancel"
      />
      <ConfirmDialog
        title="Revoke Link"
        isOpen={isRevokeDialogOpen}
        onClose={() => setIsRevokeDialogOpen(false)}
        onConfirm={handleConfirmRevokeLink}
        message="Are you sure you want to revoke this registration link?"
        confirmText="Revoke"
        cancelText="Cancel"
      />
    </div>
  );
};
export default RegistrationLinks;
