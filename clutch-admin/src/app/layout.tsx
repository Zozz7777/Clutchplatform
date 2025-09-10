import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorTrackerProvider } from "@/contexts/ErrorTrackerContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Clutch Admin Dashboard",
  description: "Administrative dashboard for Clutch Auto Parts System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <ErrorTrackerProvider>
            {children}
          </ErrorTrackerProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}