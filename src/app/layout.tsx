import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "OmniTrust",
  description: "AI-Powered Payment Security & Dispute Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="main-container">{children}</main>
        <footer className="footer">
          <p>OmniTrust &bull; PayPal AI Hackathon 2026</p>
        </footer>
      </body>
    </html>
  );
}


