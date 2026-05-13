import { createContext, useContext } from 'react';

export interface WizardOptions {
  /** Pre-select a department and skip step 1 */
  department?: 'services' | 'wellfi' | 'general';
  /** Pre-fill service name in message (e.g. "Regarding: Welding") */
  service?: string;
}

interface TalkToUsContextValue {
  isOpen: boolean;
  options: WizardOptions | null;
  openWizard: (opts?: WizardOptions) => void;
  closeWizard: () => void;
}

export const TalkToUsContext = createContext<TalkToUsContextValue | null>(null);

export const useTalkToUs = () => {
  const ctx = useContext(TalkToUsContext);
  if (!ctx) throw new Error('useTalkToUs must be inside TalkToUsProvider');
  return ctx;
};
