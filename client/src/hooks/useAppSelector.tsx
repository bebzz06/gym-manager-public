import { TypedUseSelectorHook, useSelector } from 'react-redux';
import { RootState } from '@/types/store.types';

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
