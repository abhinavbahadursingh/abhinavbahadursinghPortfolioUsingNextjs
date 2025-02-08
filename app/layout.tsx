import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/layout/footer";


const inter = Inter({subsets:["latin"]});

export const metadata: Metadata = {
  title: "Abhinav Bahadur Singh | Developer.",
  description: "Full Stack Web Developer, Android Developer, and AI & ML Engineer crafting modern web experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className}`}
      >
        <Header/>
        {children}
        <Toaster/>
        <Footer/>
      </body>
    </html>
  );
}
