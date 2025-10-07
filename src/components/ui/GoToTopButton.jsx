"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";

export default function GoToTopButton() {
  const [showGoToTop, setShowGoToTop] = useState(false);
  const [isGoToTopVisible, setIsGoToTopVisible] = useState(false);
  const [hideTimeout, setHideTimeout] = useState(null);

  // Go to top button logic
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop > 200) {
        if (!showGoToTop) {
          setShowGoToTop(true);
          setIsGoToTopVisible(true);

          // Clear existing timeout
          if (hideTimeout) {
            clearTimeout(hideTimeout);
          }

          // Set new timeout to hide after 5 seconds
          const newTimeout = setTimeout(() => {
            setIsGoToTopVisible(false);
          }, 5000);
          setHideTimeout(newTimeout);
        } else if (!isGoToTopVisible) {
          // Show again on further scroll
          setIsGoToTopVisible(true);

          // Clear existing timeout
          if (hideTimeout) {
            clearTimeout(hideTimeout);
          }

          // Set new timeout to hide after 5 seconds
          const newTimeout = setTimeout(() => {
            setIsGoToTopVisible(false);
          }, 5000);
          setHideTimeout(newTimeout);
        }
      } else {
        setShowGoToTop(false);
        setIsGoToTopVisible(false);
        if (hideTimeout) {
          clearTimeout(hideTimeout);
          setHideTimeout(null);
        }
      }
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledHandleScroll);

    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [showGoToTop, isGoToTopVisible, hideTimeout]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!showGoToTop) {
    return null;
  }

  return (
    <Button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg transition-all duration-500 ease-in-out transform bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-110 active:scale-95 ${
        isGoToTopVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-2 pointer-events-none"
      }`}
      size="icon"
      title="Go to top"
    >
      <ChevronUp className="h-5 w-5" />
    </Button>
  );
}
