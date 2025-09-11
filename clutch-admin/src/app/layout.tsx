import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorTrackerProvider } from "@/contexts/ErrorTrackerContext";
import { ThemeProvider } from "next-themes";

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
          disableTransitionOnChange={false}
        >
          <ErrorBoundary>
            <ErrorTrackerProvider>
              {children}
            </ErrorTrackerProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}