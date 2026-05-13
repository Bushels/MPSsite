import { useState, useCallback, type ReactNode } from 'react';
import { TalkToUsContext, type WizardOptions } from './talkToUs';

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
