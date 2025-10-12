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
  Tag,
  MousePointer,
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
    title: "Product Inner",
    href: "/admin/product-inner",
    icon: LayoutDashboard,
    description: "Manage product inner content",
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
    description: "Track customer orders",
  },
  {
    title: "Coupons",
    href: "/admin/coupons",
    icon: Tag,
    description: "Manage discount coupons",
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
    title: "Image Manager",
    href: "/admin/image-manager",
    icon: MousePointer,
    description: "Manage normal & hover images",
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    description: "Configure your store",
  },
];

function SidebarContent({ onItemClick, isMobile = false }) {
  const pathname = usePathname();

  return (
    <div
      className="block w-full h-screen overflow-y-auto"
      style={{ backgroundColor: "#efece3" }}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center border-b",
          isMobile ? "h-14 px-4" : "h-16 px-6"
        )}
        style={{ borderColor: "#736c5f" }}
      >
        <Link
          href="/admin"
          className="flex items-center space-x-2"
          onClick={onItemClick}
        >
          <div
            className={cn(
              "flex items-center justify-center rounded-md text-white",
              isMobile ? "h-6 w-6" : "h-8 w-8"
            )}
            style={{ backgroundColor: "#736c5f" }}
          >
            <LayoutDashboard className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
          </div>
          <span
            className={cn(
              "font-semibold text-gray-900",
              isMobile ? "text-base" : "text-lg"
            )}
          >
            AntiRomantic
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 space-y-1", isMobile ? "p-2" : "p-4")}>
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
                "flex items-center rounded-lg transition-all duration-200",
                isMobile ? "space-x-3 px-3 py-3" : "space-x-3 px-3 py-2",
                isActive
                  ? "text-white shadow-sm"
                  : "text-gray-700 hover:bg-white/50 hover:text-gray-800"
              )}
              style={isActive ? { backgroundColor: "#736c5f" } : {}}
            >
              <Icon className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
              <div className="flex flex-col min-w-0 flex-1">
                <span
                  className={cn(
                    "font-bold truncate",
                    isMobile ? "text-base" : "text-base"
                  )}
                >
                  {item.title}
                </span>
                {!isMobile && (
                  <span
                    className={cn(
                      "text-base truncate",
                      isActive ? "text-gray-200" : "text-gray-500"
                    )}
                  >
                    {item.description}
                  </span>
                )}
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
              className="fixed top-4 left-4 z-50 md:hidden bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm hover:bg-white"
              style={{ color: "#736c5f" }}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 sm:w-80">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SidebarContent
              onItemClick={() => setOpen(false)}
              isMobile={true}
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
