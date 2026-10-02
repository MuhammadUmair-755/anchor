import type { Metadata } from "next";
import { Newsreader, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import ThemeRegistry from "@/components/mui/ThemeRegistry";
import AppShell from "@/components/layout/AppShell";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  style: ["normal", "italic"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ANCHOR | Executive Life Command Center",
  description:
    "Integrated personal command center uniting financial velocity, daily operations, and long-term goal architecture.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${newsreader.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
      >
        <body className="min-h-full bg-[#F7F5EF] text-[#17202B]">
          <ThemeRegistry>
            <AppShell>{children}</AppShell>
          </ThemeRegistry>
        </body>
      </html>
    </ClerkProvider>
  );
}
