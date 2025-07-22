import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Momollie - Pet & Baby Products",
  description: "Your one-stop shop for premium pet and baby products",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-gray-100 py-8">
          <div className="container mx-auto px-4">
            <p className="text-center text-gray-600">© 2024 Momollie. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
