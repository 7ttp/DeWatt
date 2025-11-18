import React from "react";
import Image from "next/image";
import Station from "../../types/station";
import makePercentage from "../../utils/makePercentage";

interface StationDataProps {
  selectedStation: Station | null;
}

export const StationData = ({ selectedStation }: StationDataProps) => {
  return (
    <>
      <p className="text-3xl text-[#37e231] font-bold">Station</p>
      <div className="flex gap-2 items-center my-4">
        <Image
          src="./pin.svg"
          alt="Station location pin"
          width={40}
          height={40}
        />
        <p className="font-bold">Address</p>
        <span>{selectedStation?.address || "-"}</span>
      </div>
      <div className="flex gap-2 items-center my-4">
        <Image
          src="./charger.svg"
          alt="Charger compatibility icon"
          width={40}
          height={40}
        />
        <b>Compatibility</b>
        <span>BYD, EC20 and Volvo Plugs</span>
      </div>
      <div className="flex gap-2 items-center my-4">
        <Image
          src="./wallet.svg"
          alt="Price per Kw icon"
          width={40}
          height={40}
        />
        <b>Price per Kw (Voltz)</b>
        <span>{selectedStation?.meanPrice || "---"}</span>
      </div>
      <div className="flex gap-2 items-center my-4">
        <Image
          src="./capacity.svg"
          alt="Capacity icon"
          width={40}
          height={40}
        />
        <p className="font-bold">Capacity</p>
        <span>
          {selectedStation?.batteryLevel !== undefined &&
          selectedStation?.maxCapacity !== undefined
            ? `${makePercentage(
                selectedStation.batteryLevel,
                selectedStation.maxCapacity
              ).toFixed(0)}%`
            : "---"}
        </span>
      </div>
    </>
  );
};
