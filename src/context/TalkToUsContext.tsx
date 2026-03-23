// src/context/TalkToUsContext.tsx
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface WizardOptions {
  /** Pre-select 'services' department and skip step 1 */
  department?: 'services';
  /** Pre-fill service name in message (e.g. "Regarding: Welding") */
  service?: string;
}

interface TalkToUsContextValue {
  isOpen: boolean;
  options: WizardOptions | null;
  openWizard: (opts?: WizardOptions) => void;
  closeWizard: () => void;
}

const TalkToUsContext = createContext<TalkToUsContextValue | null>(null);

export const useTalkToUs = () => {
  const ctx = useContext(TalkToUsContext);
  if (!ctx) throw new Error('useTalkToUs must be inside TalkToUsProvider');
  return ctx;
};

export const TalkToUsProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<WizardOptions | null>(null);

  const openWizard = useCallback((opts?: WizardOptions) => {
    setOptions(opts ?? null);
    setIsOpen(true);
  }, []);

  const closeWizard = useCallback(() => {
    setIsOpen(false);
    setOptions(null);
  }, []);

  return (
    <TalkToUsContext.Provider value={{ isOpen, options, openWizard, closeWizard }}>
      {children}
    </TalkToUsContext.Provider>
  );
};
