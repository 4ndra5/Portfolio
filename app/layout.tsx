import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import "./image-masked-label.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const ogImage = `${protocol}://${host}/og.png`;

  return {
    title: "沈宇 — Visual Designer",
    description: "沈宇的个人作品集，聚焦品牌视觉、新媒体内容与电商设计。",
    openGraph: {
      title: "沈宇 — Visual Designer",
      description: "Ideas into visible impact.",
      type: "website",
      images: [{ url: ogImage, width: 1676, height: 943, alt: "沈宇视觉设计作品集" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "沈宇 — Visual Designer",
      description: "Ideas into visible impact.",
      images: [ogImage],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
