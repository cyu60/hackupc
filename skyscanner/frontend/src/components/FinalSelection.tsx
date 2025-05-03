
import { City } from "../types";
import { Button } from "@/components/ui/button";

interface FinalSelectionProps {
  cities: City[];
  onSelect: (city: City) => void;
  onRestart: () => void;
}

const FinalSelection: React.FC<FinalSelectionProps> = ({ cities, onSelect, onRestart }) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-6">Your Top 3 Cities</h2>
      <p className="text-center mb-6 text-gray-600">
        Based on your neural feedback, these are the cities that resonated with you the most.
        Select one to finalize your journey!
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cities.map((city) => (
          <div 
            key={city.name}
            className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="aspect-square overflow-hidden">
              <img 
                src={`${city.images[0]}&final=true`}
                alt={city.name} 
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg">{city.name}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{city.vibe}</p>
              <Button 
                className="w-full mt-4"
                onClick={() => onSelect(city)}
              >
                Select {city.name}
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <Button
          variant="outline"
          onClick={onRestart}
        >
          Start New Journey
        </Button>
      </div>
    </div>
  );
};

export default FinalSelection;
