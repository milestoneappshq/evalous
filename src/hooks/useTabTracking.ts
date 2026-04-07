"use client";

import { useEffect, useState } from 'react';

export function useTabTracking(maxStrikes: number = 3) {
  const [blurCount, setBlurCount] = useState(0);
  const [warnings, setWarnings] = useState<{ timestamp: Date; reason: string }[]>([]);
  const [isViolated, setIsViolated] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logViolation("User switched to another tab or minimized the browser.");
      }
    };

    const handleBlur = () => {
      logViolation("Test window lost focus.");
    };

    const logViolation = (reason: string) => {
      setBlurCount((prev) => {
        const newCount = prev + 1;
        
        // Log the warning
        setWarnings((w) => [...w, { timestamp: new Date(), reason }]);
        
        // Trigger strict violation condition
        if (newCount >= maxStrikes) {
          setIsViolated(true);
        }
        return newCount;
      });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [maxStrikes]);

  return { blurCount, warnings, isViolated, maxStrikes };
}
