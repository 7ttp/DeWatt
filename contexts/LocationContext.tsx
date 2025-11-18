import React, { FC, ReactNode, createContext, useContext, useState } from "react";

type LocationState = {
  location: [number | null, number | null];
  updateLocation: (lat: number, long: number) => void;
};

const LocationContext = createContext<LocationState | undefined>(undefined);

type LocationProviderProps = {
  children: ReactNode;
};

export const LocationProvider: FC<LocationProviderProps> = ({ children }) => {
  const [location, setLocation] = useState<[number | null, number | null]>([-22.951669, -43.211247]);

  const updateLocation = (lat: number, long: number) => {
    setLocation([lat, long]);
  };

  return <LocationContext.Provider value={{ location, updateLocation }}>{children}</LocationContext.Provider>;
};

// Hook personalizado para usar o contexto de localização
export const useLocation = (): LocationState => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
