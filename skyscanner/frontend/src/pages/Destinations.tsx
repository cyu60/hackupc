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

      <p className="text-center text-gray-600 mb-6 leading-relaxed">
  We’ve analyzed your team’s preferences and selected the best destinations for you.
  Now, we’re going one step further.  
  <br />
  <span className="font-semibold text-purple-700">
    Your brain will choose the perfect city — even before you realize it.
  </span>
  <br />
  During the EEG session, your emotional reactions to each place will be tracked using brainwave activity.
  <br />
  Think of it as <span className="italic">Tinder for travel, powered by your mind.</span>
</p>


      {loading && <p className="text-center text-gray-500">🧠 Thinking...</p>}

      {!loading && localCities.length > 0 && (
        <>

          <div className="flex justify-center">
            <button
              onClick={() => navigate(`/eeg-session/${encodeURIComponent(localCities[0].toLowerCase())}`)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded text-lg transition"
            >
              🚀 Sit down and let your true self Decide!
            </button>
          </div>
        </>
      )}
    </div>
  );
}
