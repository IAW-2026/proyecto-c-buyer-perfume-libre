import { MetadataRoute } from "next";
import { mockPerfumes } from "@/lib/mockPerfumes";
import { generarUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://perfume-libre-buyer.vercel.app";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/carrito`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/favoritos`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  const productRoutes: MetadataRoute.Sitemap = mockPerfumes.map((perfume) => ({
    url: `${baseUrl}/producto/${generarUrl(perfume.nombre, perfume.id)}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
