
import { City } from "../types";

interface CityCollageProps {
  city: City | null;
  isLoading: boolean;
}

const CityCollage: React.FC<CityCollageProps> = ({ city, isLoading }) => {
  if (isLoading) {
    return (
      <div className="relative w-full aspect-square max-w-3xl mx-auto">
        <div className="grid-city h-full animate-pulse">
          {Array(9).fill(0).map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-md"></div>
          ))}
        </div>
        <div className="mt-4 h-8 w-40 mx-auto bg-gray-200 rounded-md animate-pulse"></div>
      </div>
    );
  }

  if (!city) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-center text-gray-500">Enter a seed word to begin exploring cities</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="grid-city animate-fade-in">
        {city.images.map((image, index) => (
          <img
            key={index}
            src={`${image}&city=${city.name}&index=${index}`}
            alt={`${city.name} scene ${index + 1}`}
            className="transition-all duration-500 hover:scale-[1.02]"
          />
        ))}
      </div>
      <h2 className="mt-4 text-2xl font-bold text-center">{city.name}</h2>
      <p className="text-center text-gray-600 italic">{city.vibe}</p>
    </div>
  );
};

export default CityCollage;
