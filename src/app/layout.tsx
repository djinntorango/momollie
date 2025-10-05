import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DearMomollie - Handcrafted Beeswax Bread Bags & Sustainable Kitchen Accessories",
  description: "Handmade beeswax bread bags and eco-friendly kitchen accessories. Keep your homemade bread fresh naturally with our artisan-crafted, plastic-free storage solutions.",
  keywords: "beeswax bread bags, sustainable kitchen, handmade storage, eco-friendly food storage, artisan crafts, plastic-free living",
  authors: [{ name: "DearMomollie" }],
  openGraph: {
    title: "DearMomollie - Handcrafted Beeswax Bread Bags & Sustainable Kitchen Accessories",
    description: "Handmade beeswax bread bags and eco-friendly kitchen accessories for sustainable living.",
    url: "https://momollie.me",
    siteName: "DearMomollie",
    images: [
      {
        url: "/hero.png",
        width: 1200,
        height: 630,
        alt: "DearMomollie handcrafted beeswax bread bags",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DearMomollie - Handcrafted Beeswax Bread Bags",
    description: "Sustainable, handmade kitchen accessories for eco-friendly living.",
    images: ["/hero.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
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
