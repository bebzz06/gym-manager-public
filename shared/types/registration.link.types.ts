import { LinkStatus } from '../constants/registration.link.js';

export type TLinkStatus = (typeof LinkStatus)[keyof typeof LinkStatus];
