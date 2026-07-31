import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ApiAuthBootstrap } from "@/lib/auth/ApiAuthBootstrap";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PropVista CRM",
  description: "AI-Powered Real Estate Intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-body-md antialiased`}>
        <ApiAuthBootstrap>{children}</ApiAuthBootstrap>
      </body>
    </html>
  );
}
