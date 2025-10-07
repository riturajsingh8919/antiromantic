"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Search,
  User,
  Users,
  ShoppingBag,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSearch } from "@/contexts/SearchContext";

export function AdminHeader() {
  const [searchInput, setSearchInput] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const { handleGlobalSearch } = useSearch();
  const router = useRouter();

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/admin/notifications");
      const data = await response.json();

      if (data.success) {
        setNotifications(data.data.notifications);
        setNotificationCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Real-time notifications polling
  useEffect(() => {
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      handleGlobalSearch(searchInput.trim());
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit(e);
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout API
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        // Also clear client-side cookie as fallback
        document.cookie =
          "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; secure; samesite=lax";

        // Redirect to login
        router.push("/login");

        // Force reload to clear any cached data
        window.location.href = "/login";
      } else {
        console.error("Logout failed:", data.error);
        // Force logout anyway
        document.cookie =
          "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; secure; samesite=lax";
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout anyway
      document.cookie =
        "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; secure; samesite=lax";
      window.location.href = "/login";
    }
  };

  const formatNotificationTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return notificationTime.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "new_user":
        return <Users className="h-4 w-4 text-blue-600" />;
      case "new_order":
        return <ShoppingBag className="h-4 w-4 text-green-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <header
      className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b px-4 md:px-6"
      style={{ backgroundColor: "#efece3", borderColor: "#736c5f" }}
    >
      {/* Search - Hidden on mobile to prevent overlap with menu icon */}
      <div className="hidden md:flex flex-1 items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form
          onSubmit={handleSearchSubmit}
          className="ml-auto flex-1 sm:flex-initial"
        >
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-600" />
            <Input
              type="search"
              placeholder="Search for Products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] border-gray-300 focus:border-gray-500"
            />
          </div>
        </form>
      </div>

      {/* Mobile spacer */}
      <div className="flex-1 md:hidden"></div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <DropdownMenu
          open={showNotifications}
          onOpenChange={setShowNotifications}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-gray-200"
            >
              <Bell className="h-4 w-4 text-gray-700" />
              {notificationCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full text-[10px] font-medium text-white flex items-center justify-center"
                  style={{ backgroundColor: "#736c5f" }}
                >
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center justify-between">
                <span className="text-base font-medium">Notifications</span>
                {notificationCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-[#736c5f] text-white"
                  >
                    {notificationCount}
                  </Badge>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  No recent notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex flex-col items-start p-3 cursor-default focus:bg-gray-50"
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {formatNotificationTime(notification.timestamp)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        {notification.details && (
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.details}
                          </p>
                        )}
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 w-8 rounded-full hover:bg-gray-200"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback
                  className="text-gray-700"
                  style={{ backgroundColor: "#736c5f", color: "white" }}
                >
                  AD
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-base font-medium leading-none">
                    Administrator
                  </p>
                  <div className="flex items-center gap-1">
                    <div
                      className="w-2 h-2 rounded-full bg-green-500"
                      title="Active"
                    ></div>
                    <span className="text-xs text-green-600 font-medium">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className={"cursor-pointer"}
              onClick={() => router.push("/user-profile")}
            >
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={"cursor-pointer"}
              onClick={() => router.push("/admin/settings")}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className={"cursor-pointer"}
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
