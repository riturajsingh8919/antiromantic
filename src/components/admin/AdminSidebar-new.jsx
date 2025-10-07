"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  Settings,
  BarChart3,
  Image,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    description: "Overview and analytics",
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Package,
    description: "Manage your products",
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: FolderTree,
    description: "Organize your products",
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
    description: "Track customer orders",
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: Users,
    description: "Manage customers",
  },
  {
    title: "Media",
    href: "/admin/media",
    icon: Image,
    description: "Upload and manage images",
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    description: "Sales and performance",
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    description: "Configure your store",
  },
];

function SidebarContent({ onItemClick }) {
  const pathname = usePathname();

  return (
    <div
      className="flex h-full flex-col"
      style={{ backgroundColor: "#efece3" }}
    >
      {/* Logo */}
      <div
        className="flex h-16 items-center border-b px-6"
        style={{ borderColor: "#736c5f" }}
      >
        <Link href="/admin" className="flex items-center space-x-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-md text-white"
            style={{ backgroundColor: "#736c5f" }}
          >
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold text-gray-900">
            AntiRomantic
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 transition-all hover:text-gray-900",
                isActive
                  ? "text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-200"
              )}
              style={isActive ? { backgroundColor: "#736c5f" } : {}}
            >
              <Icon className="h-4 w-4" />
              <div className="flex flex-col">
                <span className="text-base font-medium">{item.title}</span>
                <span
                  className={cn(
                    "text-base",
                    isActive ? "text-gray-200" : "text-gray-500"
                  )}
                >
                  {item.description}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4" style={{ borderColor: "#736c5f" }}>
        <p className="text-base text-gray-600">© 2024 AntiRomantic Admin</p>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 z-50 md:hidden"
              style={{ color: "#736c5f" }}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SidebarContent onItemClick={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
