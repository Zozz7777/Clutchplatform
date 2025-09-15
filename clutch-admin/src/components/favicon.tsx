"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export function Favicon() {
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    const updateFavicon = () => {
      const currentTheme = resolvedTheme || theme;
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      
      if (favicon) {
        if (currentTheme === 'dark') {
          favicon.href = '/favicon-dark.png';
        } else {
          favicon.href = '/favicon-light.png';
        }
      }
    };

    updateFavicon();
  }, [theme, resolvedTheme]);

  return null;
}
