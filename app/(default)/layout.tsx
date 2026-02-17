import React from "react";
// @ts-ignore
import "../globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

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
