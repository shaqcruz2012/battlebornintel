import { useState, useEffect, useRef, useMemo } from 'react';

/**
 * Debounced window-size hook.
 * Fires at most once per `delay` ms (default 150 ms) to prevent
 * excessive re-renders during resize drag.
 */
export function useWindowSize(delay = 150) {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const timerRef = useRef(null);

  useEffect(() => {
    const onResize = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setSize({ width: window.innerWidth, height: window.innerHeight });
      }, delay);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [delay]);

  return useMemo(
    () => ({
      ...size,
      isMobile: size.width < 768,
      isTablet: size.width >= 768 && size.width < 1200,
      isDesktop: size.width >= 1200,
    }),
    [size],
  );
}
