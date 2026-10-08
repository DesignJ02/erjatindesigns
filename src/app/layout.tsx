import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import { Nav } from "@/components/Nav";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Jatin Srivastava | UX Designer",
  description:
    "UX Designer with 3+ years building B2B platforms for brands and consumers. Case studies: LocEarn, Kangaru, and Datum.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrument.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--text)]">
        <Nav />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
