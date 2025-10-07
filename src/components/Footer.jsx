"use client";

import Image from "next/image";
import React from "react";
import NewsLetter from "./NewsLetter";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ContactPopup from "./ContactPopup";
import { motion } from "framer-motion";

function Footer() {
  const pathname = usePathname();

  const isActivePage = (href) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

  // Stagger container for nav links
  const navContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  // Individual nav link animation
  const navItemVariants = {
    hidden: {
      opacity: 0,
      x: -20,
      filter: "blur(5px)",
    },
    visible: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  // Center image animation
  const imageVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 30,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 1,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.3,
      },
    },
  };

  // Newsletter section animation
  const newsletterVariants = {
    hidden: {
      opacity: 0,
      x: 30,
      filter: "blur(8px)",
    },
    visible: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.5,
      },
    },
  };

  // Bottom section stagger
  const bottomContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const bottomItemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <footer className="bg-[url('/footer-bg.png')] bg-no-repeat bg-cover bg-bottom py-16 px-4 md:px-10">
      <div className="container">
        <div className="relative flex flex-col gap-10">
          <div className="flex flex-col md:flex-row md:items-center gap-8 lg:gap-20 lg:max-w-[60%] lg:mx-auto">
            {/* Navigation Links */}
            <motion.nav
              className="relative md:w-[20%]"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={navContainerVariants}
            >
              <ul className="flex flex-col gap-2">
                <motion.li variants={navItemVariants}>
                  <Link
                    className={`text-base lg:text-xl ${
                      isActivePage("/") ? "text-[#B0ADA5]" : "text-text"
                    }`}
                    href="/"
                  >
                    home{" "}
                  </Link>
                </motion.li>
                <motion.li variants={navItemVariants}>
                  <Link
                    className={`text-base lg:text-xl ${
                      isActivePage("/about-us") ? "text-[#B0ADA5]" : "text-text"
                    }`}
                    href="/about-us"
                  >
                    about us
                  </Link>
                </motion.li>
                <motion.li variants={navItemVariants}>
                  <Link
                    className={`text-base lg:text-xl ${
                      isActivePage("/store") ? "text-[#B0ADA5]" : "text-text"
                    }`}
                    href="/store"
                  >
                    shop
                  </Link>
                </motion.li>
                <motion.li variants={navItemVariants}>
                  <Link
                    className={`text-base lg:text-xl ${
                      isActivePage("/collection")
                        ? "text-[#B0ADA5]"
                        : "text-text"
                    }`}
                    href="/collection"
                  >
                    collection{" "}
                  </Link>
                </motion.li>
                <motion.li variants={navItemVariants}>
                  <ContactPopup>
                    <button
                      className={`text-base lg:text-xl text-text hover:text-[#B0ADA5] transition-colors cursor-pointer`}
                    >
                      contact
                    </button>
                  </ContactPopup>
                </motion.li>
                <motion.li variants={navItemVariants}>
                  <Link
                    className={`text-base lg:text-xl ${
                      isActivePage("/faqs") ? "text-[#B0ADA5]" : "text-text"
                    }`}
                    href="/faqs"
                  >
                    FAQ's
                  </Link>
                </motion.li>
              </ul>
            </motion.nav>

            {/* Center Image */}
            <motion.div
              className="flex items-center relative md:w-[55%]"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={imageVariants}
            >
              <Image
                src="/home-sec-3-img.png"
                alt="Footer Logo"
                width={100}
                height={100}
                className="w-full md:h-[60vh] object-contain relative -left-1.5"
              />
            </motion.div>

            {/* Newsletter Section */}
            <motion.div
              className="relative w-[200px] md:w-[25%]"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={newsletterVariants}
            >
              <NewsLetter />
            </motion.div>
          </div>

          {/* Bottom Section */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 items-end gap-8 xl:px-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={bottomContainerVariants}
          >
            <motion.div className="flex flex-col" variants={bottomItemVariants}>
              <div className="flex gap-2">
                <Link
                  className="text-[#5E5E5E] text-base"
                  href="/privacy-policy"
                >
                  privacy policy
                </Link>
                |
                <Link
                  className="text-[#5E5E5E] text-base"
                  href="/shipping-policy"
                >
                  shipping policy
                </Link>
              </div>
              <div className="flex gap-2">
                <Link
                  className="text-[#5E5E5E] text-base"
                  href="/terms-and-condition"
                >
                  terms and condition
                </Link>
                |
                <Link
                  className="text-[#5E5E5E] text-base"
                  href="/returns-and-exchange-policy"
                >
                  returns & exchange policy
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="flex md:items-center md:justify-center"
              variants={bottomItemVariants}
            >
              <Image
                src="/footer-logo.svg"
                alt="Footer Logo"
                width={100}
                height={100}
                className="w-[150px] lg:w-[200px] h-auto object-contain"
              />
            </motion.div>

            <motion.div variants={bottomItemVariants}>
              <p className="text-text md:text-right">
                all rights reserved <br />
                copyright 2025 Antiromantic
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
