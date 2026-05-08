import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";

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
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
