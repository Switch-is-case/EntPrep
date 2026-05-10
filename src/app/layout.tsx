import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Providers from "@/components/Providers";
import NavbarWrapper from "@/components/NavbarWrapper";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "ENT Prep AI — Подготовка к ЕНТ с помощью AI",
  description:
    "Платформа подготовки к Единому Национальному Тестированию с использованием искусственного интеллекта. Диагностика, практика, прогресс.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-bg text-text antialiased min-h-screen">
        <Providers>
          <NavbarWrapper />
          <main className="pb-20 md:pb-0">{children}</main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
