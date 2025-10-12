"use client";

import Image from "next/image";
import React from "react";

function Hero() {
  return (
    <section className="relative w-full lg:h-screen">
      <div className="container1">
        <div className="flex flex-col-reverse md:flex-row relative">
          <div className="md:w-[30%] bg-[url('/bg-img.png')] bg-no-repeat bg-covers flex items-end justify-end overflow-hidden">
            <Image
              src="/hero-left.png"
              alt="Hero Image"
              width={300}
              height={275}
              className="w-full md:w-[95%] h-auto object-cover relative bottom-0 -right-10"
            />
          </div>
          <div className="md:w-[70%] col-span-2 relative flex items-center justify-center">
            <video
              src="/hero.mov"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-[80vh] lg:h-screen object-cover"
              style={{
                WebkitPlaysinline: true,
              }}
            >
              {/* Fallback for browsers that don't support the video */}
              <Image
                src="/hero-right.png"
                alt="Hero Image"
                width={700}
                height={475}
                className="w-full h-[80vh] lg:h-screen object-cover"
              />
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
