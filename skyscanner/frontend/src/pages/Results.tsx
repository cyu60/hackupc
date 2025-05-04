import { useCitySession } from "@/context/CitySessionContext";
import { useTeam } from "@/context/TeamContext";
import {useNavigate} from "react-router-dom";

export default function ResultsPage() {
  const { cities } = useCitySession();
  const { members } = useTeam();
const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <h1 className="text-3xl font-bold text-center mb-4">🧠 Your Brain’s Top Picks</h1>
      <p className="text-center text-gray-600 mb-6">
        These destinations scored highest based on your real-time brain responses. 
        No guessing — your brain made the call.
      </p>

      <ul className="max-w-xl mx-auto space-y-2 text-lg">
        {cities.slice(0, 3).map((city, i) => (
          <li key={city} className="bg-gray-100 rounded p-4 shadow text-center">
            <strong>{i + 1}. {city}</strong>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex justify-center">
        <button
          className="bg-purple-600 text-white px-6 py-3 rounded text-lg hover:bg-purple-700"
          onClick={() => navigate('/vote')}
        >
          🗳️ Proceed to Group Voting
        </button>
      </div>
    </div>
  );
}
