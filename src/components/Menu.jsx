import Link from "next/link";
import React, { useRef } from "react";
import ContactPopup from "./ContactPopup";

function Menu({ isOpen, onClose }) {
  const contactButtonRef = useRef(null);

  const handleContactClick = () => {
    onClose(); // Close menu first
    setTimeout(() => {
      // Trigger the contact popup after menu closes
      if (contactButtonRef.current) {
        contactButtonRef.current.click();
      }
    }, 300); // Small delay to ensure smooth transition
  };
  return (
    <div
      className={`fixed top-0 left-0 w-full h-screen bg-white/85 z-40 transition-transform duration-500 px-4 py-2 md:px-10 pt-[64px] lg:pt-0 ease-in-out ${
        isOpen ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {/* Close button - moved to top for better visibility */}
      <button
        onClick={onClose}
        className="absolute top-16 right-24 cursor-pointer z-50 text-xl text-black font-medium hover:underline"
      >
        close
      </button>

      {/* Left side - Menu */}

      <div className="container flex items-start lg:items-center min-h-[100dvh]">
        <nav className="flex flex-col space-y-4 md:space-y-6 w-full">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-[#736C5F]">
            shop
          </h2>
          <Link
            href="/"
            onClick={onClose}
            className="text-lg md:text-xl text-[#736C5F] hover:opacity-70 transition-opacity hover:underline w-fit"
          >
            home
          </Link>
          <Link
            href="/store"
            onClick={onClose}
            className="text-lg md:text-xl text-[#736C5F] hover:opacity-70 transition-opacity hover:underline w-fit"
          >
            all
          </Link>
          <Link
            href="/store?category=tops"
            onClick={onClose}
            className="text-lg md:text-xl text-[#736C5F] hover:opacity-70 transition-opacity hover:underline w-fit"
          >
            tops
          </Link>
          <Link
            href="/store?category=bottoms"
            onClick={onClose}
            className="text-lg md:text-xl text-[#736C5F] hover:opacity-70 transition-opacity hover:underline w-fit"
          >
            bottoms
          </Link>
          <Link
            href="/store?category=dresses"
            onClick={onClose}
            className="text-lg md:text-xl text-[#736C5F] hover:opacity-70 transition-opacity hover:underline w-fit"
          >
            dresses
          </Link>
          <Link
            href="/store?category=shorts"
            onClick={onClose}
            className="text-lg md:text-xl text-[#736C5F] hover:opacity-70 transition-opacity hover:underline w-fit"
          >
            shorts
          </Link>

          <div className="mt-4 space-y-3 md:space-y-4">
            <Link
              href="/collection"
              onClick={onClose}
              className="text-xl md:text-2xl text-[#736C5F] hover:opacity-70 transition-opacity block hover:underline w-fit"
            >
              collection
            </Link>
            <Link
              href="/about-us"
              onClick={onClose}
              className="text-xl md:text-2xl text-[#736C5F] hover:opacity-70 transition-opacity block hover:underline w-fit"
            >
              about
            </Link>
            <button
              onClick={handleContactClick}
              className="text-xl md:text-2xl text-[#736C5F] hover:opacity-70 transition-opacity block hover:underline w-fit text-left"
            >
              contact
            </button>
          </div>
        </nav>
      </div>

      {/* Hidden Contact Popup Trigger */}
      <ContactPopup>
        <button
          ref={contactButtonRef}
          style={{
            position: "absolute",
            opacity: 0,
            pointerEvents: "none",
            left: "-9999px",
          }}
          aria-hidden="true"
        >
          Hidden Contact Trigger
        </button>
      </ContactPopup>
    </div>
  );
}

export default Menu;
