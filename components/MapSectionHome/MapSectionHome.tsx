import React, { useMemo } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import stationsList from "./stations";

export default function MapSectionHome() {
  const router = useRouter();

  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/Map/Map"), {
        loading: () => <p>map is loading</p>,
        ssr: false,
      }),
    []
  );

  return (
    <div className="px-10 mb-20" id="map">
      <Card className="flex-wrap 2xl:flex-nowrap max-w-screen-2xl  px-4 pb-4 flex mx-auto bg-[#080908] border-2 border-[#161d15] gap-6">
        <div className="w-[600px] mx-auto p-4 content-around flex flex-wrap flex-row min-w-16 md:bg-[#0e0f0e] md:border-2 md:border-[#161d15] md:mt-4 md:rounded-md">
          <h2 className="font-bold mx-auto text-center text-3xl md:5xl">
            Find a station near you
          </h2>
          <p className="py-6 hidden text-center md:block">
            Find the closest station to you and start charging your car now! All stations are guaranteed to be compatible with Type-2 AC and CCS2 DC plugs. 
          </p>

        </div>
        <div className="w-full rounded-2xl mt-3 m-auto">
          <Map
            center={[20.5937, 78.9629]}
            stations={stationsList}
            height="350px"
            roundedBottomCorners
            roundedTopCorners
            userLocation={[12.9716, 77.5946]}
          />
        </div>
      </Card>
    </div>
  );
}
