import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#faf8f4",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://perfume-libre-buyer.vercel.app",
  ),
  title: {
    default: "Perfume Libre — Marketplace C2C de Fragancias Auténticas",
    template: "%s | Perfume Libre",
  },
  description:
    "Descubre y compra fragancias auténticas de vendedores verificados con envíos a todo el país y resúmenes de opiniones generados por Inteligencia Artificial.",
  openGraph: {
    title: "Perfume Libre — Marketplace de Fragancias",
    description:
      "Descubre y compra fragancias auténticas de vendedores verificados.",
    url: "https://perfume-libre-buyer.vercel.app",
    siteName: "Perfume Libre",
    locale: "es_AR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased overflow-x-hidden`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-foreground focus:text-background focus:rounded-sm focus:shadow-xl focus:text-xs focus:font-bold focus:uppercase focus:tracking-wider focus:outline-none focus:ring-2 focus:ring-accent"
        >
          Saltar al contenido principal
        </a>
        <ClerkProvider>
          <ScrollToTop />
          {children}
          <Toaster position="bottom-right" />
        </ClerkProvider>
      </body>
    </html>
  );
}
