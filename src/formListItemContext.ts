import { createContext } from 'solid-js';
import type { BetterForm } from './type';

export const FormListItemContext = createContext<{
  formFieldName: BetterForm.NamePath;
  autoCombineFieldName: boolean;
  index: number;
  remove?: () => void;
}>();
