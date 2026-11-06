import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BIAI CRM — Smart Enquiry Management & AI Operations",
  description: "Enterprise CRM and intelligent enquiry triage system for Bangladesh Institute of AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-[#f8fafc] text-slate-900 font-sans min-h-screen selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
