import React, { useEffect, useState } from "react";
import { useGeolocation } from "@uidotdev/usehooks";
import { LocateIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { useLocation } from "../../contexts/LocationContext";

const GetUserGeolocationDialog = () => {

  const geolocation = useGeolocation();
  const { location, updateLocation } = useLocation();
  const [userLocation, setUserLocation] = useState([0, 0])
  const [isDialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if ((geolocation.latitude && geolocation.longitude)) {
      console.log("okay");
      setDialogOpen(false);
      updateLocation(geolocation.latitude, geolocation.longitude)
    } else if (userLocation[0] && userLocation[1]) {
      setDialogOpen(false);
      updateLocation(userLocation[0], userLocation[1])
    } else {
      setDialogOpen(true);
    }
  }, [geolocation, userLocation, updateLocation]); // Adicionado updateLocation nas dependências

  const ignoreGeolocation = () => {
    setUserLocation([-22.980214, -43.217508])
  }

  return (
    <>
      <Dialog open={isDialogOpen}>
        <DialogContent className="bg-[#1a1a1a] border-none shadow-lg">
          <DialogTitle className="text-3xl flex text-white pb-2 gap-3"><LocateIcon color="#0f0" size={37}></LocateIcon> Allow access to your location</DialogTitle>
          <DialogDescription>
            Don&apos;t worry, we won&apos;t store your location data. We only need to know your location to show you the nearest chargers.
          </DialogDescription>
          <button onClick={ignoreGeolocation} className="bg-[#333] text-[#999] font-semibold px-4 py-2 rounded-lg hover:scale-105 transition">
            I don&apos;t care, use a sample location
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GetUserGeolocationDialog;
