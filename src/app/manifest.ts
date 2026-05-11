import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ENT Prep AI",
    short_name: "ENT Prep",
    description: "Платформа подготовки к ЕНТ с использованием искусственного интеллекта",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f6fb",
    theme_color: "#2563eb",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
