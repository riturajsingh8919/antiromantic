import Image from "next/image";
import React from "react";

function AboutSectionFour() {
  return (
    <section className="relative md:px-10 bg-[url('/about/about-sec-4-bg.png')] bg-cover bg-center bg-no-repeat text-white flex items-center justify-center py-16 min-h-[60vh]">
      <div className="container">
        <div className="flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            {/* Central Icon */}
            <Image
              src="/about/about-sec-4-icon.svg"
              alt="About Section 4 Image"
              width={100}
              height={75}
              className="w-[75px] h-auto object-contain z-10"
            />

            {/* Top text - intentional */}
            <h3 className="text-2xl absolute -top-20 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              intentional
            </h3>

            {/* Left text - warm */}
            <h3 className="text-2xl absolute top-1/2 -left-30 transform -translate-y-1/2 -rotate-90 whitespace-nowrap">
              warm
            </h3>

            {/* Right text - personal */}
            <h3 className="text-2xl absolute top-1/2 -right-30 transform -translate-y-1/2 rotate-90 whitespace-nowrap">
              personal
            </h3>

            {/* Bottom text - thoughtfully simple */}
            <h3 className="text-2xl absolute -bottom-20 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              thoughtfully simple
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSectionFour;
