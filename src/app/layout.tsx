import React from "react";
import "@/app/globals.css";
import "react-toastify/dist/ReactToastify.css";
import { Metadata } from "next";
import { ClientProvider } from "@/components/ClientProvider";

export const metadata: Metadata = {
  title: "Idea Roulette",
  description: "Spin up startup ideas and generate AI task lists",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}
