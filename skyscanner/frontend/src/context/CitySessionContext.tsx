// context/CitySessionContext.tsx
import React, { createContext, useContext, useState } from "react";

type CitySessionContextType = {
  cities: string[];
  setCities: (c: string[]) => void;
};

const CitySessionContext = createContext<CitySessionContextType | undefined>(undefined);

export const CitySessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [cities, setCities] = useState<string[]>([]);

  return (
    <CitySessionContext.Provider value={{ cities, setCities }}>
      {children}
    </CitySessionContext.Provider>
  );
};

export const useCitySession = () => {
  const context = useContext(CitySessionContext);
  if (!context) throw new Error("CitySession must be used inside a provider");
  return context;
};
