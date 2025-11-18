import Image from "next/image";
import React from "react";
import BYD from "@/public/BYD.svg";
import GWM from "@/public/GWM.svg";
import Haval from "@/public/haval.svg";
import News from "@/public/news.png";
import { ChevronDown } from "lucide-react";


export default function BrandsSection() {
  return (
    <div className="text-center max-w-screen-xl mx-auto mb-10 lg:mb-20">
      <h2 className="text-xl mb-6 text-neutral-500 ">
      As seen in 
       </h2>
      <div className="flex flex-wrap gap-8 md:gap-14 justify-center px-10">
      <Image style={{ width: '100%' }} src={News} alt="car company logo"/>
        {/* <Image width={150} src={Haval} alt="car company logo"/>
        <Image width={80} src={GWM} alt="car company logo"/>
        <Image width={100} src={BYD} alt="car company logo"/> */}
      </div>
      <ChevronDown
          className="mx-auto hidden md:block p-2 md:p-0 md:mt-10 "
          color="#ccc"
          size={70}
          strokeWidth={1}
        />
    </div>
  );
}
