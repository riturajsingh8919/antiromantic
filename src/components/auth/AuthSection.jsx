import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProfileModal from "./ProfileModal";

function AuthSection({
  textColor = "#F7F5EB",
  isScrolled = false,
  shouldUseWhiteText = false,
}) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Function to get the correct text color
  const getTextColor = () => {
    if (shouldUseWhiteText) return "text-white";
    if (isScrolled) return "text-black";
    return `text-[${textColor}]`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 w-16 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // Authenticated user
  if (isAuthenticated) {
    return (
      <ProfileModal textColor={textColor}>
        <button
          className={`${getTextColor()} text-base md:text-lg cursor-pointer hover:opacity-70 transition-opacity`}
        >
          Profile
        </button>
      </ProfileModal>
    );
  }

  // Not authenticated
  const handleLoginClick = () => {
    router.push("/login");
  };

  return (
    <button
      onClick={handleLoginClick}
      className={`${getTextColor()} text-base md:text-lg cursor-pointer hover:opacity-70 transition-opacity`}
    >
      Log in
    </button>
  );
}

export default AuthSection;
