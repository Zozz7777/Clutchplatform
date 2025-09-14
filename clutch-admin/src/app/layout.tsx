import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorTrackerProvider } from "@/contexts/ErrorTrackerContext";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from '@/contexts/i18n-context';
import { ReactErrorBoundary } from "@/components/debug/react-error-boundary";
import { ComponentTracker } from "@/components/debug/component-tracker";
import "@/lib/init-error-tracking";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Clutch Admin Dashboard",
  description: "Administrative dashboard for Clutch Auto Parts System",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-light.png', media: '(prefers-color-scheme: light)' },
      { url: '/favicon-dark.png', media: '(prefers-color-scheme: dark)' },
    ],
    apple: '/favicon-light.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body className={inter.className}>
        <I18nProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem={true}
            disableTransitionOnChange={true}
          >
            <AuthProvider>
              <ReactErrorBoundary>
                <ErrorBoundary>
                  <ErrorTrackerProvider>
                    <ComponentTracker name="AppRoot">
                      {children}
                    </ComponentTracker>
                  </ErrorTrackerProvider>
                </ErrorBoundary>
              </ReactErrorBoundary>
            </AuthProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}