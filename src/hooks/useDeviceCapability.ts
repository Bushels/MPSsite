import { useState, useEffect } from 'react';

interface DeviceCapability {
  isTouch: boolean;
  isLowEnd: boolean;
  prefersReducedMotion: boolean;
  cores: number;
  tier: 'low' | 'mid' | 'high';
}

export const useDeviceCapability = (): DeviceCapability => {
  const [capability, setCapability] = useState<DeviceCapability>(() => {
    const isTouch = typeof window !== 'undefined'
      ? window.matchMedia('(hover: none) and (pointer: coarse)').matches
      : false;
    const cores = typeof navigator !== 'undefined'
      ? navigator.hardwareConcurrency || 4
      : 4;
    const prefersReducedMotion = typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
    const isLowEnd = cores < 4 || (isTouch && cores < 6);
    const tier = prefersReducedMotion ? 'low' : isLowEnd ? 'low' : isTouch ? 'mid' : 'high';

    return { isTouch, isLowEnd, prefersReducedMotion, cores, tier };
  });

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const touchQuery = window.matchMedia('(hover: none) and (pointer: coarse)');

    const update = () => {
      const isTouch = touchQuery.matches;
      const cores = navigator.hardwareConcurrency || 4;
      const prefersReducedMotion = motionQuery.matches;
      const isLowEnd = cores < 4 || (isTouch && cores < 6);
      const tier = prefersReducedMotion ? 'low' : isLowEnd ? 'low' : isTouch ? 'mid' : 'high';
      setCapability({ isTouch, isLowEnd, prefersReducedMotion, cores, tier });
    };

    motionQuery.addEventListener('change', update);
    touchQuery.addEventListener('change', update);
    return () => {
      motionQuery.removeEventListener('change', update);
      touchQuery.removeEventListener('change', update);
    };
  }, []);

  return capability;
};
