import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Abhinav Baldha - Product and Strategy Expert",
  description:
    "Explore insights on Product Analytics, Product Research, Product Marketing, and Product Management from Abhinav Baldha, where intuition meets data and user research.",
  keywords: [
    "Product Strategy",
    "Product Analytics",
    "Product Research",
    "Product Marketing",
    "Product Management",
    "Data-driven Decisions",
    "User Research",
    "Business Strategy",
  ],
  openGraph: {
    title: "Abhinav Baldha - Product and Strategy Expert",
    description:
      "Abhinav Baldha's blog on Product Analytics, Research, Marketing, and Management. Learn how to fuse design, data, and technology for business growth.",
    type: "website",
    // url: "https://abhinavbaldha.com",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@AbhinavBaldha",
    title: "Abhinav Baldha - Product and Strategy Expert",
    description:
      "Abhinav Baldha's blog on Product Analytics, Research, Marketing, and Management. Learn how to fuse design, data, and technology for business growth.",
    // image: "/path/to/default-image.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <TooltipProvider>
        <body className={` antialiased`}>{children}</body>
      </TooltipProvider>
    </html>
  );
}
