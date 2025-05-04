import React from "react";
import { City } from "../types";

interface CityCollageProps {
  city: City | null;
  isLoading: boolean;
}

const CityCollage: React.FC<CityCollageProps> = ({ city, isLoading }) => {
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="h-8 w-40 mx-auto bg-gray-200 rounded-md animate-pulse mb-4" />
        <div className="text-center mb-6 text-gray-400">Loading images...</div>
        <div className="grid grid-cols-3 gap-2">
          {Array(9).fill(0).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-md animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!city) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-center text-gray-500">Enter a destination to begin exploring.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <h2 className="text-3xl font-bold text-center">{city.name}</h2>
      <p className="text-center text-gray-600 italic mt-1 mb-6">{city.vibe}</p>

      <div className="grid grid-cols-3 gap-2 rounded overflow-hidden">
        {city.images.map((image, index) => (
          <img
            key={index}
            src={`${image}&city=${city.name}&index=${index}`}
            alt={`${city.name} scene ${index + 1}`}
            className="aspect-square object-cover w-full h-full transition-all duration-300 hover:scale-105"
          />
        ))}
      </div>
    </div>
  );
};

export default CityCollage;
