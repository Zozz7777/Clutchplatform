import type { Metadata } from "next";
import { Roboto, Roboto_Serif, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";

const roboto = Roboto({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto"
});

const robotoSerif = Roboto_Serif({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto-serif"
});

const robotoMono = Roboto_Mono({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto-mono"
});

export const metadata: Metadata = {
  title: "Clutch Admin - Enterprise Platform Management",
  description: "Comprehensive enterprise platform for managing the entire Clutch automotive ecosystem",
  keywords: ["clutch", "admin", "enterprise", "automotive", "fleet management"],
  authors: [{ name: "Clutch Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.variable} ${robotoSerif.variable} ${robotoMono.variable} font-sans`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}