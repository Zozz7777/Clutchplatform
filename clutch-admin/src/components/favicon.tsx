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
      
      // Also update the shortcut icon
      const shortcutIcon = document.querySelector('link[rel="shortcut icon"]') as HTMLLinkElement;
      if (shortcutIcon) {
        if (currentTheme === 'dark') {
          shortcutIcon.href = '/favicon-dark.png';
        } else {
          shortcutIcon.href = '/favicon-light.png';
        }
      }
    };

    updateFavicon();
  }, [theme, resolvedTheme]);

  return null;
}

