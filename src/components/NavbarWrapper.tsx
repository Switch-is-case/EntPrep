"use client";

import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";
import { useApp } from "./Providers";

export default function NavbarWrapper() {
  const pathname = usePathname();
  const { isFullPageMode } = useApp();

  const isTestRoute = pathname?.startsWith("/mock-exam/") && !pathname.endsWith("/results");
  
  if (pathname?.startsWith("/admin") || isFullPageMode || isTestRoute) return null;
  
  return <Navbar />;
}
