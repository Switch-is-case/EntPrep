import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Providers from "@/components/Providers";
import NavbarWrapper from "@/components/NavbarWrapper";
import { BottomNav } from "@/components/BottomNav";
import PWARegistration from "@/components/PWARegistration";

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "ENT Prep AI — Подготовка к ЕНТ с помощью AI",
  description:
    "Платформа подготовки к Единому Национальному Тестированию с использованием искусственного интеллекта. Диагностика, практика, прогресс.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ENT Prep AI",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-bg text-text antialiased min-h-screen">
        <Providers>
          <PWARegistration />
          <NavbarWrapper />
          <main className="pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">{children}</main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
