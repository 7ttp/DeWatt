import chatGPTImage from "@/public/ChatGPT Image Oct 22, 2025, 02_33_40 AM.png";
import Image from "next/image";
import stepsToSell from "@/public/stepsToSell.svg";
import { Button } from "../ui/button";
import { ChevronRight } from "lucide-react";

export default function StepsToBuyAndSell() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="bg-black pt-8" id="info">
      <div className="flex justify-center mb-8">
        <p className="text-4xl font-bold px-8 text-center text-white">
          See how easy it is to charge your car with DeWatt
        </p>
      </div>
      <div className="flex justify-center w-full px-4 md:px-8">
        <div className="w-full max-w-7xl">
          <Image 
            src={chatGPTImage} 
            alt="DeWatt charging process" 
            width={1200} 
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
      <div className="flex justify-center mt-20">
        <div className="px-12 md:px-12 mt-4 md:mt-12 max-w-screen-2xl w-full md:flex">
          <p className="text-3xl md:text-4xl font-semibold md:px-10 mb-2 md:w-[40%]">
            Become an Energy Seller with DeWatt
          </p>
          <p className="md:w-[60%] text-neutral-400 mb-4 text-base md:text-lg">
            Join DeWatt&apos;s network and start selling energy with minimal
            bureaucracy. Our straightforward process ensures you can quickly and
            efficiently begin contributing to the energy marketplace. By
            becoming a part of DeWatt, you take an active role in shaping a
            sustainable future while generating income from your surplus energy.
          </p>
          <Button onClick={() => scrollToSection("support")}>
            Join as a Seller
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
