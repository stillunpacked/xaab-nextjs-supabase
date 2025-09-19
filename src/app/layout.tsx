import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import Navigation from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "XAAB - XISS Alumni Association Bangalore",
  description: "Connecting XISS alumni across the globe, fostering lifelong relationships, and creating opportunities for growth and collaboration.",
  keywords: "XISS, Alumni, Bangalore, Association, Networking, Events, Community",
  authors: [{ name: "XAAB Team" }],
  openGraph: {
    title: "XAAB - XISS Alumni Association Bangalore",
    description: "Connecting XISS alumni across the globe, fostering lifelong relationships, and creating opportunities for growth and collaboration.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <Navigation />
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
