import React from "react";
import Image from "next/image";
import chargingstation from "./Assets/chargingstation.svg";

const HowItWorks: React.FC = () => {
  return (
    <div>
      <div className="grid grid-cols-2 grid-rows-1 gap-4 mx-auto w-1/2 mb-20">
        <div className="items-center justify-center">
          <Image
            src={chargingstation}
            alt="Charging Station"
            width={500}
            height={100}
          />
        </div>
        <div>
        <p className="text-3xl text-start mt-4">
              How it Works?
            </p>
            <p className="text-start text-neutral-400 mt-2">
            DeWatt exists to forge connections between those with energy to sell
            and those needing to power their electric vehicles. This initiative
            invigorates the market, making it more dynamic by allowing the
            forces of supply and demand to dictate pricing. It also enables
            producers of all sizes, from the small-scale to the large-scale, to
            operate their own charging stations, democratizing the energy
            landscape.
            </p>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
