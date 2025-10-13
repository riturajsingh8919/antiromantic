import Image from "next/image";
import React from "react";
import CurtainRevealSection from "@/components/CurtainRevealSection";

function HomeSectionTwo() {
  return (
    <section className="relative bg-[url('/home-sec-2-bg.png')] bg-no-repeat bg-cover py-16 md:px-10">
      <div className="container">
        <CurtainRevealSection>
          <div className="max-w-2xl mx-auto flex flex-col items-center justify-center gap-4">
            <div className="flex flex-col md:flex-row gap-2 md:gap-4">
              <h2 className="text-[#827C71] text-xl lg:text-3xl">
                Where Every Stitch{" "}
              </h2>
              <p className="text-[#827C71] flex gap-2 items-center text-base">
                <span>
                  Our thoughtfully crafted pieces
                  <br /> embrace both ease and elegance
                </span>
                <Image
                  src="/home-sec-2-icon.svg"
                  alt="icon"
                  width={40}
                  height={36}
                />
              </p>
            </div>
            <div className="flex gap-4 items-center">
              <h2 className="text-[#827C71] text-xl lg:text-3xl">speaks</h2>
              <video
                src="/hero.mov"
                autoPlay
                loop
                muted
                playsInline
                className="w-[200px] h-auto object-cover"
                style={{
                  WebkitPlaysinline: true,
                }}
              />
              <h2 className="text-[#827C71] text-xl lg:text-3xl">self-love</h2>
            </div>
          </div>
        </CurtainRevealSection>
      </div>
    </section>
  );
}

export default HomeSectionTwo;
