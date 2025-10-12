import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  ShoppingBag,
  Settings,
  LogOut,
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from "lucide-react";
import Link from "next/link";

function ProfileModal({ children, textColor = "#F7F5EB" }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleAdminClick = () => {
    router.push("/admin");
  };

  const handleUserDashboard = () => {
    router.push("/user-profile");
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-80 bg-white border"
        style={{ borderColor: "#736c5f" }}
        align="end"
        forceMount
      >
        {/* User Profile Section */}
        <DropdownMenuLabel className="font-normal">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback
                  className="text-white font-normal text-lg"
                  style={{ backgroundColor: "#736c5f" }}
                >
                  {user?.username?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-base font-normal leading-none">
                  {user?.username}
                </p>
                <p
                  className="text-base leading-none"
                  style={{ color: "#736c5f" }}
                >
                  {user?.role === "admin" ? "Administrator" : "Customer"}
                </p>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator style={{ backgroundColor: "#efece3" }} />

        {/* Dashboard Access - Role-based */}
        <DropdownMenuSeparator style={{ backgroundColor: "#efece3" }} />

        {user?.role === "admin" ? (
          <DropdownMenuItem
            className="cursor-pointer hover:bg-gray-50"
            onClick={handleAdminClick}
          >
            <Shield className="mr-2 h-4 w-4" style={{ color: "#736c5f" }} />
            <span className="font-normal">Admin Dashboard</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="cursor-pointer hover:bg-gray-50"
            onClick={handleUserDashboard}
          >
            <User className="mr-2 h-4 w-4" style={{ color: "#736c5f" }} />
            <span className="font-normal">My Dashboard</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator style={{ backgroundColor: "#efece3" }} />

        {/* Logout */}
        <DropdownMenuItem
          className="cursor-pointer hover:bg-red-50 text-[#736c5f]"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ProfileModal;
