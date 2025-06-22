import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import ConditionalHeader from "../components/ui/conditional-header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LuckyLease - A Sublet Marketplace",
  description:
    "Find and list short-term housing for students and interns. Connect with verified hosts offering subletting, student housing, intern accommodation, and temporary rentals.",
  keywords: [
    "sublet",
    "subletting",
    "student housing",
    "intern accommodation",
    "short-term rental",
    "temporary housing",
    "housing marketplace",
    "student apartments",
    "furnished rooms",
    "monthly rentals",
    "college housing",
    "university accommodation",
    "shared housing",
    "room rental",
    "affordable housing",
  ],
  authors: [
    { name: "Spencer Kelly " },
    { name: "" },
    { name: "" },
    { name: "" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConditionalHeader />
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#10b981',
              color: '#ffffff',
            },
          }}
        />
      </body>
    </html>
  );
}
