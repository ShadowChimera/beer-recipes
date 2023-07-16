import { useRef, useCallback } from 'react';

const useScrollObservation = (
  onVisible: () => void,
  deps: React.DependencyList
) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  return useCallback((node: HTMLDivElement) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        onVisible();
      }
    });

    if (node) {
      observerRef.current.observe(node);
    }
  }, deps);
};

export default useScrollObservation;
