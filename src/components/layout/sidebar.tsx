"use client";

import {
  LayoutDashboard,
  FileText,
  FileEdit,
  Settings,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../providers/auth-context";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Posts",
      href: "/posts",
      icon: FileText,
    },
    {
      name: "Drafts",
      href: "/drafts",
      icon: FileEdit,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform bg-background transition-transform duration-200 ease-in-out border-r",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:relative md:translate-x-0"
      )}
    >
      <div className="flex h-full flex-col p-4">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-bold">Blog Manager</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <nav className="space-y-2 flex-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>
        <div className="border-t pt-4 space-y-2">
          <Link href="/">
            <Button className="w-full" variant="secondary">
              View Site
            </Button>
          </Link>
          {isAuthenticated && (
            <Button onClick={logout} className="w-full" variant="outline">
              Logout
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
