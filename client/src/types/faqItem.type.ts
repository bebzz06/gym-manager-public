import { IFAQ } from './faq.type';
export interface IFaqItem {
  active: number | null;
  handleToggle: (index: number) => void;
  faq: IFAQ;
}
