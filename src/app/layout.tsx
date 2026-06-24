import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "SUTANTING - Susu Ketan Topping Premium",
  description: "Sensasi tradisi ketan pulen hangat dengan perpaduan kuah susu gurih dan topping modern yang melimpah. Higienis, bergizi, dan tanpa bahan pengawet.",
  icons: {
    icon: "/sutanting.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href="/sutanting.ico" />
      </head>
      <body className="min-h-full flex flex-col bg-sand text-ink selection:bg-terra/30">
        {children}
      </body>
    </html>
  );
}
