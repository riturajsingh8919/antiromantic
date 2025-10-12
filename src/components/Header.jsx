"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Menu from "./Menu";
import AuthSection from "./auth/AuthSection";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";

function Header({ textcolor = "#28251F" }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [shouldUseWhiteText, setShouldUseWhiteText] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();
  const { getWishlistCount } = useWishlist();
  const { getCartCount } = useCart();

  // Define pages where text should be white
  const whiteTextPages = ["/about-us", "/store", "/charity", "/collection"];

  useEffect(() => {
    // Handle pathname-based color changes after hydration
    setShouldUseWhiteText(whiteTextPages.includes(pathname));
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrolled = currentScrollY > 0;

      setIsScrolled(scrolled);

      // Show/hide header based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past 100px - hide header
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show header
        setIsVisible(true);
      }

      // Always show header when at the top
      if (currentScrollY <= 50) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, shouldUseWhiteText, pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Function to get text color with debugging
  const getTextColor = () => {
    let color;
    // When scrolled, override shouldUseWhiteText to false
    const useWhiteText = shouldUseWhiteText && !isScrolled;

    if (useWhiteText) {
      color = "text-[#F7F5EB]";
    } else if (isScrolled) {
      color = "text-[#28251F]";
    } else {
      color = `text-[${textcolor}]`;
    }
    return color;
  };

  return (
    <>
      <header
        className={`fixed left-0 right-0 z-50 w-full px-4 py-4 md:px-10 flex items-center h-[49px] transition-transform duration-300 ease-in-out ${
          isScrolled ? "scrolled" : ""
        } ${isVisible ? "top-0 translate-y-0" : "-top-full -translate-y-full"}`}
      >
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="flex cursor-pointer" onClick={toggleMenu}>
              <Image
                className="w-[150px] md:w-[200px] h-auto object-contain"
                src="/logo.svg"
                alt="logo"
                width={254}
                height={41}
              />
            </div>
            <div className="flex gap-3 md:gap-6 items-center">
              <Link href="/cart?tab=wishlist">
                <button
                  className={`${getTextColor()} text-base md:text-lg cursor-pointer hover:opacity-80 transition-opacity`}
                >
                  wishlist({getWishlistCount()})
                </button>
              </Link>
              <Link href="/cart?tab=cart">
                <button
                  className={`${getTextColor()} text-base md:text-lg cursor-pointer hover:opacity-80 transition-opacity`}
                >
                  cart({getCartCount()})
                </button>
              </Link>

              {/* Authentication Section - All functionality extracted to separate component */}
              <AuthSection
                textColor={textcolor}
                shouldUseWhiteText={shouldUseWhiteText && !isScrolled}
                isScrolled={isScrolled}
              />
            </div>
          </div>
        </div>
      </header>

      <Menu isOpen={isMenuOpen} onClose={closeMenu} />
    </>
  );
}

export default Header;
