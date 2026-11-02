import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "WARDEN — AI Agent Wallet Authorization Assurance",
  description: "Security testing, permission intelligence, and authorization assurance for NEAR AI agent wallets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-warden-bg text-warden-text-primary antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
