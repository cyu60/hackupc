import { useTeam } from "@/context/TeamContext";
import { useCitySession } from "@/context/CitySessionContext";
import { useEffect, useState } from "react";
import { fetchSuggestedCities } from "@/lib/gpt";
import { useNavigate } from "react-router-dom";

export default function Destinations() {
  const { members } = useTeam();
  const { setCities } = useCitySession(); // ✅ Use context to save globally
  const [localCities, setLocalCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      const result = await fetchSuggestedCities(members);
      setLocalCities(result);     // for local rendering
      setCities(result);          // for context/global use
      setLoading(false);
    };

    run();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-4">🌍 Suggested Destinations</h1>

      <p className="text-center text-gray-600 mb-6">
        We've selected destinations that match your group's preferences. 
        In the next step, each team member will go through a personalized EEG session 
        where their brain reacts to beautiful images of each destination.
      </p>

      {loading && <p className="text-center text-gray-500">🧠 Thinking...</p>}

      {!loading && localCities.length > 0 && (
        <>
          <ul className="bg-white p-4 rounded shadow space-y-2 mb-6">
            {localCities.map((city, index) => (
              <li key={index} className="text-center text-lg">
                {index + 1}. {city}
              </li>
            ))}
          </ul>

          <div className="flex justify-center">
            <button
              onClick={() => navigate(`/eeg-session/${encodeURIComponent(localCities[0].toLowerCase())}`)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded text-lg transition"
            >
              🚀 Start EEG Session
            </button>
          </div>
        </>
      )}
    </div>
  );
}
