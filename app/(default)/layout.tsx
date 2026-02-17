import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
// @ts-ignore
import "../globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ziren Printing Shop | Professional Printing Services",
  description:
    "Quality printing services for all your needs - business cards, banners, flyers, and more. Fast turnaround and competitive prices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-col min-h-screen bg-background">
      <Header />
      <div className="grow mt-16 p-4 flex flex-col">{children}</div>
      <Footer />
    </main>
  );
}
