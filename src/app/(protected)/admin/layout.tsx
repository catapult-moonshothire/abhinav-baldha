import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/providers/auth-context";

export const metadata: Metadata = {
  title: "Abhinav Baldha",
  description: "Abhinav Baldha",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <TooltipProvider>
        <body className={` antialiased`}>
          <AuthProvider>{children}</AuthProvider>
        </body>
      </TooltipProvider>
    </html>
  );
}
