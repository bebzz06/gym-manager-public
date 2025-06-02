import { getMemberRegistrationLinks } from '@/http/RegistrationLink';
import {
  fetchRegistrationLinksStart,
  fetchRegistrationLinksFailure,
  fetchRegistrationLinksSuccess,
} from '@/store/slices/registrationLinksSlice';
import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
export const useRegistrationLinks = () => {
  const dispatch = useAppDispatch();
  const { registrationLinks, loading, error } = useAppSelector(state => state.registrationLinks);

  const fetchRegistrationLinks = async () => {
    dispatch(fetchRegistrationLinksStart());
    try {
      const links = await getMemberRegistrationLinks();
      dispatch(fetchRegistrationLinksSuccess(links));
    } catch (error: any) {
      dispatch(fetchRegistrationLinksFailure(error.message || 'Error fetching registration links'));
      console.log(error);
    }
  };

  return { registrationLinks, loading, error, fetchRegistrationLinks };
};
